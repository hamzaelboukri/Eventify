import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto, UpdateEventDto, QueryEventDto } from './dto';

export interface PaginatedEvents {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  canceledEvents: number;
  upcomingEvents: number;
  totalCapacity: number;
  totalReserved: number;
  averageFillRate: number;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  /**
   * Create a new event
   */
  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const event = new this.eventModel({
      ...createEventDto,
      organizer: new Types.ObjectId(organizerId),
      reservedSpots: 0,
    });
    return event.save();
  }

  /**
   * Find all events with filtering and pagination
   */
  async findAll(queryDto: QueryEventDto): Promise<PaginatedEvents> {
    const {
      search,
      category,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'asc',
    } = queryDto;

    const query: Record<string, unknown> = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        (query.date as Record<string, Date>).$gte = new Date(dateFrom);
      }
      if (dateTo) {
        (query.date as Record<string, Date>).$lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [events, total] = await Promise.all([
      this.eventModel
        .find(query)
        .populate('organizer', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments(query),
    ]);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all published events (public access)
   */
  async findPublished(queryDto: QueryEventDto): Promise<PaginatedEvents> {
    return this.findAll({
      ...queryDto,
      status: EventStatus.PUBLISHED,
    });
  }

  /**
   * Find all events by organizer
   */
  async findByOrganizer(organizerId: string, queryDto: QueryEventDto): Promise<PaginatedEvents> {
    const {
      search,
      category,
      status,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'asc',
    } = queryDto;

    const query: Record<string, unknown> = {
      organizer: new Types.ObjectId(organizerId),
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [events, total] = await Promise.all([
      this.eventModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments(query),
    ]);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one event by ID
   */
  async findOne(id: string): Promise<Event> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID événement invalide');
    }

    const event = await this.eventModel
      .findById(id)
      .populate('organizer', 'name email')
      .exec();

    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }

    return event;
  }

  /**
   * Find one published event by ID (public access)
   */
  async findOnePublished(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Événement non trouvé ou non publié');
    }

    return event;
  }

  /**
   * Update an event
   */
  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Check authorization
    if (!isAdmin && event.organizer.toString() !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cet événement");
    }

    // Validate capacity change
    if (
      updateEventDto.capacity !== undefined &&
      updateEventDto.capacity < event.reservedSpots
    ) {
      throw new BadRequestException(
        `La capacité ne peut pas être inférieure au nombre de places réservées (${event.reservedSpots})`,
      );
    }

    Object.assign(event, updateEventDto);
    return event.save();
  }

  /**
   * Publish an event
   */
  async publish(id: string, userId: string, isAdmin: boolean): Promise<Event> {
    const event = await this.findOne(id);

    if (!isAdmin && event.organizer.toString() !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à publier cet événement");
    }

    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Un événement annulé ne peut pas être publié');
    }

    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException('Cet événement est déjà publié');
    }

    event.status = EventStatus.PUBLISHED;
    return event.save();
  }

  /**
   * Cancel an event
   */
  async cancel(id: string, userId: string, isAdmin: boolean): Promise<Event> {
    const event = await this.findOne(id);

    if (!isAdmin && event.organizer.toString() !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à annuler cet événement");
    }

    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Cet événement est déjà annulé');
    }

    event.status = EventStatus.CANCELED;
    return event.save();
  }

  /**
   * Delete an event
   */
  async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const event = await this.findOne(id);

    if (!isAdmin && event.organizer.toString() !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cet événement");
    }

    if (event.reservedSpots > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un événement avec des réservations actives',
      );
    }

    await this.eventModel.findByIdAndDelete(id);
  }

  /**
   * Update reserved spots (used by reservation service)
   */
  async updateReservedSpots(id: string, increment: number): Promise<Event> {
    const event = await this.findOne(id);

    const newReservedSpots = event.reservedSpots + increment;

    if (newReservedSpots < 0) {
      throw new BadRequestException('Le nombre de places réservées ne peut pas être négatif');
    }

    if (newReservedSpots > event.capacity) {
      throw new BadRequestException("Plus de places disponibles pour cet événement");
    }

    event.reservedSpots = newReservedSpots;
    return event.save();
  }

  /**
   * Check if event is available for reservation
   */
  async checkAvailability(id: string): Promise<{
    available: boolean;
    availableSpots: number;
    message?: string;
  }> {
    const event = await this.findOne(id);

    if (event.status !== EventStatus.PUBLISHED) {
      return {
        available: false,
        availableSpots: 0,
        message: "Cet événement n'est pas disponible pour les réservations",
      };
    }

    if (new Date(event.date) < new Date()) {
      return {
        available: false,
        availableSpots: 0,
        message: 'Cet événement est déjà passé',
      };
    }

    const availableSpots = event.capacity - event.reservedSpots;

    if (availableSpots <= 0) {
      return {
        available: false,
        availableSpots: 0,
        message: 'Cet événement est complet',
      };
    }

    return {
      available: true,
      availableSpots,
    };
  }

  /**
   * Get event statistics
   */
  async getStats(): Promise<EventStats> {
    const now = new Date();

    const [
      totalEvents,
      publishedEvents,
      draftEvents,
      canceledEvents,
      upcomingEvents,
      capacityStats,
    ] = await Promise.all([
      this.eventModel.countDocuments(),
      this.eventModel.countDocuments({ status: EventStatus.PUBLISHED }),
      this.eventModel.countDocuments({ status: EventStatus.DRAFT }),
      this.eventModel.countDocuments({ status: EventStatus.CANCELED }),
      this.eventModel.countDocuments({
        status: EventStatus.PUBLISHED,
        date: { $gte: now },
      }),
      this.eventModel.aggregate([
        { $match: { status: EventStatus.PUBLISHED } },
        {
          $group: {
            _id: null,
            totalCapacity: { $sum: '$capacity' },
            totalReserved: { $sum: '$reservedSpots' },
          },
        },
      ]),
    ]);

    const totalCapacity = capacityStats[0]?.totalCapacity || 0;
    const totalReserved = capacityStats[0]?.totalReserved || 0;
    const averageFillRate = totalCapacity > 0 ? (totalReserved / totalCapacity) * 100 : 0;

    return {
      totalEvents,
      publishedEvents,
      draftEvents,
      canceledEvents,
      upcomingEvents,
      totalCapacity,
      totalReserved,
      averageFillRate: Math.round(averageFillRate * 100) / 100,
    };
  }

  /**
   * Get upcoming events
   */
  async getUpcoming(limit: number = 5): Promise<Event[]> {
    return this.eventModel
      .find({
        status: EventStatus.PUBLISHED,
        date: { $gte: new Date() },
      })
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get categories with event counts
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.eventModel.aggregate([
      { $match: { status: EventStatus.PUBLISHED } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
  }
}
