import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto, QueryReservationDto } from './dto';
import { EventsService } from '../events/events.service';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';
import { EventStatus } from '../../common/enums/event-status.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    private eventsService: EventsService,
  ) {}

  private generateTicketNumber(): string {
    return `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  async create(
    createReservationDto: CreateReservationDto,
    userId: string,
  ): Promise<ReservationDocument> {
    const event = await this.eventsService.findOne(createReservationDto.eventId);

    // Business rule: Cannot reserve a canceled event
    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Cannot reserve a canceled event');
    }

    // Business rule: Cannot reserve a non-published event
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Cannot reserve a non-published event');
    }

    // Business rule: Cannot reserve if event is full
    if (event.reservedCount >= event.capacity) {
      throw new BadRequestException('Event is fully booked');
    }

    // Business rule: Cannot reserve if user already has active reservation
    const existingReservation = await this.reservationModel.findOne({
      event: new Types.ObjectId(createReservationDto.eventId),
      participant: new Types.ObjectId(userId),
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });

    if (existingReservation) {
      throw new ConflictException('You already have an active reservation for this event');
    }

    const reservation = new this.reservationModel({
      event: new Types.ObjectId(createReservationDto.eventId),
      participant: new Types.ObjectId(userId),
      notes: createReservationDto.notes,
    });

    const savedReservation = await reservation.save();

    // Increment reserved count on event
    await this.eventsService.incrementReservedCount(createReservationDto.eventId);

    return this.findOne(savedReservation._id.toString());
  }

  async findAll(query: QueryReservationDto) {
    const { status, eventId, participantId, page = 1, limit = 10 } = query;

    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (eventId) {
      filter.event = new Types.ObjectId(eventId);
    }

    if (participantId) {
      filter.participant = new Types.ObjectId(participantId);
    }

    const skip = (page - 1) * limit;

    const [reservations, total] = await Promise.all([
      this.reservationModel
        .find(filter)
        .populate('event', 'title date location')
        .populate('participant', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reservationModel.countDocuments(filter).exec(),
    ]);

    return {
      data: reservations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByParticipant(userId: string, query: QueryReservationDto) {
    return this.findAll({ ...query, participantId: userId });
  }

  async findByEvent(eventId: string, query: QueryReservationDto) {
    return this.findAll({ ...query, eventId });
  }

  async findOne(id: string): Promise<ReservationDocument> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('event', 'title description date location capacity')
      .populate('participant', 'firstName lastName email phone')
      .exec();

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async confirm(id: string): Promise<ReservationDocument> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be confirmed');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.ticketNumber = this.generateTicketNumber();
    reservation.confirmedAt = new Date();

    return reservation.save();
  }

  async refuse(id: string): Promise<ReservationDocument> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be refused');
    }

    reservation.status = ReservationStatus.REFUSED;

    // Decrement reserved count when refused
    await this.eventsService.decrementReservedCount(reservation.event._id.toString());

    return reservation.save();
  }

  async cancel(id: string, userId: string, isAdmin: boolean): Promise<ReservationDocument> {
    const reservation = await this.findOne(id);

    // Check ownership if not admin
    if (!isAdmin && reservation.participant._id.toString() !== userId) {
      throw new BadRequestException('You can only cancel your own reservations');
    }

    // Business rule: Can only cancel pending or confirmed reservations
    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException('Only pending or confirmed reservations can be canceled');
    }

    reservation.status = ReservationStatus.CANCELED;
    reservation.canceledAt = new Date();

    // Decrement reserved count when canceled
    await this.eventsService.decrementReservedCount(reservation.event._id.toString());

    return reservation.save();
  }

  async getStatistics() {
    const [totalReservations, reservationsByStatus, recentReservations] = await Promise.all([
      this.reservationModel.countDocuments().exec(),
      this.reservationModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.reservationModel
        .find()
        .populate('event', 'title')
        .populate('participant', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
    ]);

    return {
      totalReservations,
      reservationsByStatus: reservationsByStatus.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentReservations,
    };
  }

  async getTicketData(id: string, userId: string, isAdmin: boolean) {
    const reservation = await this.findOne(id);

    // Check ownership if not admin
    if (!isAdmin && reservation.participant._id.toString() !== userId) {
      throw new BadRequestException('You can only access your own tickets');
    }

    // Business rule: Ticket only available for confirmed reservations
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Ticket is only available for confirmed reservations');
    }

    return reservation;
  }
}
