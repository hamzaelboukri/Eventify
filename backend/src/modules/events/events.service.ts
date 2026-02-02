import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto, UpdateEventDto, QueryEventDto } from './dto';
import { EventStatus } from '../../common/enums/event-status.enum';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<EventDocument> {
    const event = new this.eventModel({
      ...createEventDto,
      createdBy: new Types.ObjectId(userId),
    });

    return event.save();
  }

  async findAll(query: QueryEventDto) {
    const { search, status, category, fromDate, toDate, page = 1, limit = 10 } = query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        (filter.date as Record<string, Date>).$gte = new Date(fromDate);
      }
      if (toDate) {
        (filter.date as Record<string, Date>).$lte = new Date(toDate);
      }
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments(filter).exec(),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublished(query: QueryEventDto) {
    return this.findAll({ ...query, status: EventStatus.PUBLISHED });
  }

  async findOne(id: string): Promise<EventDocument> {
    const event = await this.eventModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findPublishedById(id: string): Promise<EventDocument> {
    const event = await this.findOne(id);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Event not found or not available');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<EventDocument> {
    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async publish(id: string): Promise<EventDocument> {
    const event = await this.findOne(id);

    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Cannot publish a canceled event');
    }

    event.status = EventStatus.PUBLISHED;
    return event.save();
  }

  async cancel(id: string): Promise<EventDocument> {
    const event = await this.findOne(id);
    event.status = EventStatus.CANCELED;
    return event.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async incrementReservedCount(id: string): Promise<EventDocument> {
    const event = await this.eventModel
      .findByIdAndUpdate(id, { $inc: { reservedCount: 1 } }, { new: true })
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async decrementReservedCount(id: string): Promise<EventDocument> {
    const event = await this.eventModel
      .findByIdAndUpdate(id, { $inc: { reservedCount: -1 } }, { new: true })
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async getStatistics() {
    const now = new Date();

    const [totalEvents, upcomingEvents, publishedEvents, canceledEvents, eventsByStatus] =
      await Promise.all([
        this.eventModel.countDocuments().exec(),
        this.eventModel
          .countDocuments({
            status: EventStatus.PUBLISHED,
            date: { $gte: now },
          })
          .exec(),
        this.eventModel.countDocuments({ status: EventStatus.PUBLISHED }).exec(),
        this.eventModel.countDocuments({ status: EventStatus.CANCELED }).exec(),
        this.eventModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ]);

    // Calculate average fill rate for published events
    const fillRateData = await this.eventModel.aggregate([
      { $match: { status: EventStatus.PUBLISHED } },
      {
        $project: {
          fillRate: {
            $cond: [{ $eq: ['$capacity', 0] }, 0, { $divide: ['$reservedCount', '$capacity'] }],
          },
        },
      },
      { $group: { _id: null, avgFillRate: { $avg: '$fillRate' } } },
    ]);

    const averageFillRate = fillRateData[0]?.avgFillRate || 0;

    return {
      totalEvents,
      upcomingEvents,
      publishedEvents,
      canceledEvents,
      averageFillRate: Math.round(averageFillRate * 100),
      eventsByStatus: eventsByStatus.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
