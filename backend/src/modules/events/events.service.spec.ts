import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { Event, EventDocument } from './schemas/event.schema';
import { EventStatus } from '../../common/enums/event-status.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;

  const mockEvent = {
    _id: 'event-id-123',
    title: 'Test Event',
    description: 'Test Description',
    date: new Date('2026-03-15'),
    location: 'Test Location',
    capacity: 100,
    reservedCount: 0,
    status: EventStatus.DRAFT,
    createdBy: 'user-id-123',
    save: jest.fn(),
  };

  const mockEventModel = {
    new: jest.fn().mockResolvedValue(mockEvent),
    constructor: jest.fn().mockResolvedValue(mockEvent),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto = {
        title: 'New Event',
        description: 'Event Description',
        date: '2026-03-15',
        location: 'Event Location',
        capacity: 50,
      };

      const mockSavedEvent = { ...mockEvent, ...createEventDto };

      jest.spyOn(service, 'create').mockResolvedValue(mockSavedEvent as unknown as EventDocument);

      const result = await service.create(createEventDto, 'user-id-123');

      expect(result.title).toBe(createEventDto.title);
    });
  });

  describe('findOne', () => {
    it('should return an event if found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEvent),
      };

      mockEventModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('event-id-123');

      expect(result).toEqual(mockEvent);
      expect(mockEventModel.findById).toHaveBeenCalledWith('event-id-123');
    });

    it('should throw NotFoundException if event not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockEventModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should publish a draft event', async () => {
      const draftEvent = {
        ...mockEvent,
        status: EventStatus.DRAFT,
        save: jest.fn().mockResolvedValue({
          ...mockEvent,
          status: EventStatus.PUBLISHED,
        }),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(draftEvent as unknown as EventDocument);

      const result = await service.publish('event-id-123');

      expect(draftEvent.save).toHaveBeenCalled();
      expect(result.status).toBe(EventStatus.PUBLISHED);
    });

    it('should throw BadRequestException when trying to publish a canceled event', async () => {
      const canceledEvent = {
        ...mockEvent,
        status: EventStatus.CANCELED,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(canceledEvent as unknown as EventDocument);

      await expect(service.publish('event-id-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel an event', async () => {
      const publishedEvent = {
        ...mockEvent,
        status: EventStatus.PUBLISHED,
        save: jest.fn().mockResolvedValue({
          ...mockEvent,
          status: EventStatus.CANCELED,
        }),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(publishedEvent as unknown as EventDocument);

      const result = await service.cancel('event-id-123');

      expect(publishedEvent.save).toHaveBeenCalled();
      expect(result.status).toBe(EventStatus.CANCELED);
    });
  });

  describe('incrementReservedCount', () => {
    it('should increment reserved count', async () => {
      const updatedEvent = {
        ...mockEvent,
        reservedCount: 1,
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedEvent),
      };

      mockEventModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.incrementReservedCount('event-id-123');

      expect(result.reservedCount).toBe(1);
      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'event-id-123',
        { $inc: { reservedCount: 1 } },
        { new: true },
      );
    });
  });

  describe('decrementReservedCount', () => {
    it('should decrement reserved count', async () => {
      const updatedEvent = {
        ...mockEvent,
        reservedCount: 0,
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedEvent),
      };

      mockEventModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.decrementReservedCount('event-id-123');

      expect(result.reservedCount).toBe(0);
      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'event-id-123',
        { $inc: { reservedCount: -1 } },
        { new: true },
      );
    });
  });
});
