import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventsService } from './events.service';
import { Event, EventStatus } from './schemas/event.schema';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let model: Model<Event>;

  const mockOrganizerId = new Types.ObjectId().toString();
  const mockEventId = new Types.ObjectId().toString();

  const mockEvent = {
    _id: mockEventId,
    title: 'Test Event',
    description: 'Test Description for the event with more than 10 characters',
    date: new Date('2026-03-15'),
    time: '10:00',
    location: 'Test Location',
    category: 'Formation',
    capacity: 100,
    reservedSpots: 10,
    status: EventStatus.DRAFT,
    organizer: new Types.ObjectId(mockOrganizerId),
    save: jest.fn().mockResolvedValue(this),
    toJSON: jest.fn().mockReturnValue(this),
  };

  const mockEventModel = {
    new: jest.fn().mockResolvedValue(mockEvent),
    constructor: jest.fn().mockResolvedValue(mockEvent),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
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
    model = module.get<Model<Event>>(getModelToken(Event.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const createEventDto = {
        title: 'New Event',
        description: 'New event description with more than 10 characters',
        date: '2026-03-20',
        time: '14:00',
        location: 'New Location',
        capacity: 50,
      };

      const savedEvent = {
        ...createEventDto,
        _id: new Types.ObjectId(),
        organizer: new Types.ObjectId(mockOrganizerId),
        reservedSpots: 0,
        status: EventStatus.DRAFT,
        save: jest.fn().mockResolvedValue({
          ...createEventDto,
          _id: new Types.ObjectId(),
          organizer: new Types.ObjectId(mockOrganizerId),
        }),
      };

      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(savedEvent as any));

      // Mock the constructor
      const mockSave = jest.fn().mockResolvedValue(savedEvent);
      (model as any).prototype = { save: mockSave };

        await service.create(createEventDto, mockOrganizerId);
    });
  });

  describe('findOne', () => {
    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if event not found', async () => {
      const validId = new Types.ObjectId().toString();
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
    });

    it('should return event if found', async () => {
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        }),
      });

      const result = await service.findOne(mockEventId);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findOnePublished', () => {
    it('should throw NotFoundException if event is not published', async () => {
      const draftEvent = { ...mockEvent, status: EventStatus.DRAFT };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(draftEvent),
        }),
      });

      await expect(service.findOnePublished(mockEventId)).rejects.toThrow(NotFoundException);
    });

    it('should return event if published', async () => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(publishedEvent),
        }),
      });

      const result = await service.findOnePublished(mockEventId);
      expect(result.status).toBe(EventStatus.PUBLISHED);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user is not authorized', async () => {
      const differentUserId = new Types.ObjectId().toString();
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockEvent,
            organizer: { toString: () => mockOrganizerId },
          }),
        }),
      });

      await expect(
        service.update(mockEventId, { title: 'Updated' }, differentUserId, false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if capacity is less than reserved spots', async () => {
      const eventWithReservations = {
        ...mockEvent,
        reservedSpots: 20,
        organizer: { toString: () => mockOrganizerId },
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(eventWithReservations),
        }),
      });

      await expect(
        service.update(mockEventId, { capacity: 10 }, mockOrganizerId, true),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('publish', () => {
    it('should throw BadRequestException if event is canceled', async () => {
      const canceledEvent = {
        ...mockEvent,
        status: EventStatus.CANCELED,
        organizer: { toString: () => mockOrganizerId },
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(canceledEvent),
        }),
      });

      await expect(service.publish(mockEventId, mockOrganizerId, true)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if already published', async () => {
      const publishedEvent = {
        ...mockEvent,
        status: EventStatus.PUBLISHED,
        organizer: { toString: () => mockOrganizerId },
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(publishedEvent),
        }),
      });

      await expect(service.publish(mockEventId, mockOrganizerId, true)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should publish a draft event', async () => {
      const draftEvent = {
        ...mockEvent,
        status: EventStatus.DRAFT,
        organizer: { toString: () => mockOrganizerId },
        save: jest.fn().mockResolvedValue({
          ...mockEvent,
          status: EventStatus.PUBLISHED,
        }),
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(draftEvent),
        }),
      });

      await service.publish(mockEventId, mockOrganizerId, true);
      expect(draftEvent.save).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should throw BadRequestException if already canceled', async () => {
      const canceledEvent = {
        ...mockEvent,
        status: EventStatus.CANCELED,
        organizer: { toString: () => mockOrganizerId },
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(canceledEvent),
        }),
      });

      await expect(service.cancel(mockEventId, mockOrganizerId, true)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should cancel a published event', async () => {
      const publishedEvent = {
        ...mockEvent,
        status: EventStatus.PUBLISHED,
        organizer: { toString: () => mockOrganizerId },
        save: jest.fn().mockResolvedValue({
          ...mockEvent,
          status: EventStatus.CANCELED,
        }),
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(publishedEvent),
        }),
      });

      await service.cancel(mockEventId, mockOrganizerId, true);
      expect(publishedEvent.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if event has reservations', async () => {
      const eventWithReservations = {
        ...mockEvent,
        reservedSpots: 5,
        organizer: { toString: () => mockOrganizerId },
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(eventWithReservations),
        }),
      });

      await expect(service.remove(mockEventId, mockOrganizerId, true)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete event without reservations', async () => {
      const eventWithoutReservations = {
        ...mockEvent,
        reservedSpots: 0,
        organizer: { toString: () => mockOrganizerId },
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(eventWithoutReservations),
        }),
      });
      mockEventModel.findByIdAndDelete.mockResolvedValue(null);

      await service.remove(mockEventId, mockOrganizerId, true);
      expect(mockEventModel.findByIdAndDelete).toHaveBeenCalledWith(mockEventId);
    });
  });

  describe('checkAvailability', () => {
    it('should return not available for non-published events', async () => {
      const draftEvent = {
        ...mockEvent,
        status: EventStatus.DRAFT,
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(draftEvent),
        }),
      });

      const result = await service.checkAvailability(mockEventId);
      expect(result.available).toBe(false);
    });

    it('should return not available for past events', async () => {
      const pastEvent = {
        ...mockEvent,
        status: EventStatus.PUBLISHED,
        date: new Date('2020-01-01'),
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(pastEvent),
        }),
      });

      const result = await service.checkAvailability(mockEventId);
      expect(result.available).toBe(false);
    });

    it('should return not available for full events', async () => {
      const fullEvent = {
        ...mockEvent,
        status: EventStatus.PUBLISHED,
        date: new Date('2030-01-01'),
        capacity: 10,
        reservedSpots: 10,
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(fullEvent),
        }),
      });

      const result = await service.checkAvailability(mockEventId);
      expect(result.available).toBe(false);
      expect(result.availableSpots).toBe(0);
    });

    it('should return available with spots for available events', async () => {
      const availableEvent = {
        ...mockEvent,
        status: EventStatus.PUBLISHED,
        date: new Date('2030-01-01'),
        capacity: 100,
        reservedSpots: 50,
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(availableEvent),
        }),
      });

      const result = await service.checkAvailability(mockEventId);
      expect(result.available).toBe(true);
      expect(result.availableSpots).toBe(50);
    });
  });

  describe('updateReservedSpots', () => {
    it('should throw BadRequestException if result would be negative', async () => {
      const event = {
        ...mockEvent,
        reservedSpots: 5,
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(event),
        }),
      });

      await expect(service.updateReservedSpots(mockEventId, -10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if result exceeds capacity', async () => {
      const event = {
        ...mockEvent,
        capacity: 10,
        reservedSpots: 8,
      };
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(event),
        }),
      });

      await expect(service.updateReservedSpots(mockEventId, 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
