import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventStatus } from './schemas/event.schema';
import { UserRole } from '../users/schemas/user.schema';
import { Types } from 'mongoose';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockUserId = new Types.ObjectId().toString();
  const mockEventId = new Types.ObjectId().toString();

  const mockUser = {
    userId: mockUserId,
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  const mockEvent = {
    _id: mockEventId,
    title: 'Test Event',
    description: 'Test Description',
    date: new Date('2026-03-15'),
    time: '10:00',
    location: 'Test Location',
    category: 'Formation',
    capacity: 100,
    reservedSpots: 10,
    status: EventStatus.DRAFT,
    organizer: mockUserId,
  };

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPublished: jest.fn(),
    findByOrganizer: jest.fn(),
    findOne: jest.fn(),
    findOnePublished: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
    cancel: jest.fn(),
    remove: jest.fn(),
    checkAvailability: jest.fn(),
    getStats: jest.fn(),
    getUpcoming: jest.fn(),
    getCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockEventsService.create.mockResolvedValue({
        ...createEventDto,
        _id: mockEventId,
        organizer: mockUserId,
        status: EventStatus.DRAFT,
      });

      const result = await controller.create(createEventDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createEventDto, mockUserId);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated events for admin', async () => {
      const queryDto = { page: 1, limit: 10 };
      const paginatedResult = {
        events: [mockEvent],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockEventsService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findPublished', () => {
    it('should return published events', async () => {
      const queryDto = { page: 1, limit: 10 };
      const paginatedResult = {
        events: [{ ...mockEvent, status: EventStatus.PUBLISHED }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockEventsService.findPublished.mockResolvedValue(paginatedResult);

      const result = await controller.findPublished(queryDto);

      expect(service.findPublished).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findMyEvents', () => {
    it('should return organizer events', async () => {
      const queryDto = { page: 1, limit: 10 };
      const paginatedResult = {
        events: [mockEvent],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockEventsService.findByOrganizer.mockResolvedValue(paginatedResult);

      const result = await controller.findMyEvents(queryDto, mockUser);

      expect(service.findByOrganizer).toHaveBeenCalledWith(mockUserId, queryDto);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a published event', async () => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      mockEventsService.findOnePublished.mockResolvedValue(publishedEvent);

      const result = await controller.findOne(mockEventId);

      expect(service.findOnePublished).toHaveBeenCalledWith(mockEventId);
      expect(result).toEqual(publishedEvent);
    });
  });

  describe('findOneAdmin', () => {
    it('should return any event for admin', async () => {
      mockEventsService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOneAdmin(mockEventId);

      expect(service.findOne).toHaveBeenCalledWith(mockEventId);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto = { title: 'Updated Title' };
      const updatedEvent = { ...mockEvent, ...updateEventDto };

      mockEventsService.update.mockResolvedValue(updatedEvent);

      const result = await controller.update(mockEventId, updateEventDto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        mockEventId,
        updateEventDto,
        mockUserId,
        true,
      );
      expect(result).toEqual(updatedEvent);
    });
  });

  describe('publish', () => {
    it('should publish an event', async () => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };

      mockEventsService.publish.mockResolvedValue(publishedEvent);

      const result = await controller.publish(mockEventId, mockUser);

      expect(service.publish).toHaveBeenCalledWith(mockEventId, mockUserId, true);
      expect(result.status).toBe(EventStatus.PUBLISHED);
    });
  });

  describe('cancel', () => {
    it('should cancel an event', async () => {
      const canceledEvent = { ...mockEvent, status: EventStatus.CANCELED };

      mockEventsService.cancel.mockResolvedValue(canceledEvent);

      const result = await controller.cancel(mockEventId, mockUser);

      expect(service.cancel).toHaveBeenCalledWith(mockEventId, mockUserId, true);
      expect(result.status).toBe(EventStatus.CANCELED);
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      mockEventsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockEventId, mockUser);

      expect(service.remove).toHaveBeenCalledWith(mockEventId, mockUserId, true);
    });
  });

  describe('checkAvailability', () => {
    it('should return availability status', async () => {
      const availability = {
        available: true,
        availableSpots: 90,
      };

      mockEventsService.checkAvailability.mockResolvedValue(availability);

      const result = await controller.checkAvailability(mockEventId);

      expect(service.checkAvailability).toHaveBeenCalledWith(mockEventId);
      expect(result).toEqual(availability);
    });
  });

  describe('getStats', () => {
    it('should return event statistics', async () => {
      const stats = {
        totalEvents: 10,
        publishedEvents: 5,
        draftEvents: 3,
        canceledEvents: 2,
        upcomingEvents: 4,
        totalCapacity: 500,
        totalReserved: 200,
        averageFillRate: 40,
      };

      mockEventsService.getStats.mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(service.getStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming events', async () => {
      const upcomingEvents = [mockEvent];

      mockEventsService.getUpcoming.mockResolvedValue(upcomingEvents);

      const result = await controller.getUpcoming(5);

      expect(service.getUpcoming).toHaveBeenCalledWith(5);
      expect(result).toEqual(upcomingEvents);
    });
  });

  describe('getCategories', () => {
    it('should return categories with counts', async () => {
      const categories = [
        { category: 'Formation', count: 5 },
        { category: 'Conference', count: 3 },
      ];

      mockEventsService.getCategories.mockResolvedValue(categories);

      const result = await controller.getCategories();

      expect(service.getCategories).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });
});
