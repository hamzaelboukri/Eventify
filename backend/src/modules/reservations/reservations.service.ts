import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationStatus } from './schemas/reservation.schema';
import { Event, EventStatus } from '../events/schemas/event.schema';
import { CreateReservationDto } from './dto';

export interface PaginatedReservations {
  reservations: Reservation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  refused: number;
  canceled: number;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string): Promise<Reservation> {
    const { eventId, notes } = createReservationDto;

    // Check if event exists and is published
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Cet événement n\'est pas disponible pour les réservations');
    }

    // Check availability
    if (event.reservedSpots >= event.capacity) {
      throw new BadRequestException('Cet événement est complet');
    }

    // Check if user already has a reservation for this event
    const existingReservation = await this.reservationModel.findOne({
      participant: new Types.ObjectId(userId),
      event: new Types.ObjectId(eventId),
      status: { $nin: [ReservationStatus.CANCELED, ReservationStatus.REFUSED] },
    });

    if (existingReservation) {
      throw new ConflictException('Vous avez déjà une réservation pour cet événement');
    }

    // Create reservation
    const reservation = new this.reservationModel({
      participant: new Types.ObjectId(userId),
      event: new Types.ObjectId(eventId),
      notes,
      status: ReservationStatus.PENDING,
    });

    await reservation.save();

    
    // Populate and return
    const populated = await this.reservationModel
      .findById(reservation._id)
      .populate('event')
      .populate('participant', 'name email')
      .exec();
    
    return populated!;
  }

  async findAll(query: {
    status?: string;
    eventId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedReservations> {
    const { status, eventId, page = 1, limit = 10 } = query;
    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (eventId) {
      filter.event = new Types.ObjectId(eventId);
    }

    const total = await this.reservationModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const reservations = await this.reservationModel
      .find(filter)
      .populate('event')
      .populate('participant', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      reservations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByUser(userId: string, query: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedReservations> {
    const { status, page = 1, limit = 10 } = query;
    const filter: Record<string, unknown> = {
      participant: new Types.ObjectId(userId),
    };

    if (status) {
      filter.status = status;
    }

    const total = await this.reservationModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const reservations = await this.reservationModel
      .find(filter)
      .populate('event')
      .populate('participant', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      reservations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('event')
      .populate('participant', 'name email');

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    return reservation;
  }

  async confirm(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Cette réservation ne peut pas être confirmée');
    }

    // Check event availability
    const event = await this.eventModel.findById(reservation.event);
    if (!event || event.reservedSpots >= event.capacity) {
      throw new BadRequestException('L\'événement est complet');
    }

    // Update reservation status
    reservation.status = ReservationStatus.CONFIRMED;
    await reservation.save();

    // Increment reserved spots
    await this.eventModel.findByIdAndUpdate(reservation.event, {
      $inc: { reservedSpots: 1 },
    });

    const populated = await this.reservationModel
      .findById(id)
      .populate('event')
      .populate('participant', 'name email')
      .exec();
    
    return populated!;
  }

  async refuse(id: string, reason?: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Cette réservation ne peut pas être refusée');
    }

    reservation.status = ReservationStatus.REFUSED;
    if (reason) {
      reservation.refusedReason = reason;
    }
    await reservation.save();

    const populated = await this.reservationModel
      .findById(id)
      .populate('event')
      .populate('participant', 'name email')
      .exec();
    
    return populated!;
  }

  async cancel(id: string, userId: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    // Check if user owns this reservation
    if (reservation.participant.toString() !== userId) {
      throw new BadRequestException('Vous ne pouvez pas annuler cette réservation');
    }

    if (reservation.status === ReservationStatus.CANCELED) {
      throw new BadRequestException('Cette réservation est déjà annulée');
    }

    const wasConfirmed = reservation.status === ReservationStatus.CONFIRMED;

    reservation.status = ReservationStatus.CANCELED;
    await reservation.save();

    // Decrement reserved spots if was confirmed
    if (wasConfirmed) {
      await this.eventModel.findByIdAndUpdate(reservation.event, {
        $inc: { reservedSpots: -1 },
      });
    }

    const populated = await this.reservationModel
      .findById(id)
      .populate('event')
      .populate('participant', 'name email')
      .exec();
    
    return populated!;
  }

  async getStats(): Promise<ReservationStats> {
    const [total, pending, confirmed, refused, canceled] = await Promise.all([
      this.reservationModel.countDocuments(),
      this.reservationModel.countDocuments({ status: ReservationStatus.PENDING }),
      this.reservationModel.countDocuments({ status: ReservationStatus.CONFIRMED }),
      this.reservationModel.countDocuments({ status: ReservationStatus.REFUSED }),
      this.reservationModel.countDocuments({ status: ReservationStatus.CANCELED }),
    ]);

    return { total, pending, confirmed, refused, canceled };
  }
}
