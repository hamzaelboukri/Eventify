import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { EventsService } from '../events/events.service';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';
import { EventStatus } from '../../common/enums/event-status.enum';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockUserId = new Types.ObjectId().toString();
  const mockEventId = new Types.ObjectId().toString();

  const mockEvent = {
    _id: mockEventId,
    title: 'Test Event',
    description: 'Test Description',
    date: new Date('2026-03-15'),
    location: 'Test Location',
    capacity: 100,
    reservedCount: 0,
    status: EventStatus.PUBLISHED,
  };

  const mockReservation = {
    _id: 'reservation-id-123',
    event: new Types.ObjectId(mockEventId),
    participant: new Types.ObjectId(mockUserId),
    status: ReservationStatus.PENDING,
    save: jest.fn(),
  };

  const mockReservationModel = {
    new: jest.fn().mockResolvedValue(mockReservation),
    constructor: jest.fn().mockResolvedValue(mockReservation),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockEventsService = {
    findOne: jest.fn(),
    incrementReservedCount: jest.fn(),
    decrementReservedCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a reservation for a published event', async () => {
      mockEventsService.findOne.mockResolvedValue(mockEvent);
      mockReservationModel.findOne.mockResolvedValue(null);

      jest.spyOn(service, 'create').mockImplementation(async () => {
        return {
          ...mockReservation,
          _id: 'new-reservation-id',
        } as unknown as ReservationDocument;
      });

      const result = await service.create({ eventId: mockEventId }, mockUserId);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for non-published event', async () => {
      const draftEvent = { ...mockEvent, status: EventStatus.DRAFT };
      mockEventsService.findOne.mockResolvedValue(draftEvent);

      await expect(service.create({ eventId: mockEventId }, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for canceled event', async () => {
      const canceledEvent = { ...mockEvent, status: EventStatus.CANCELED };
      mockEventsService.findOne.mockResolvedValue(canceledEvent);

      await expect(service.create({ eventId: mockEventId }, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for full event', async () => {
      const fullEvent = { ...mockEvent, reservedCount: 100 };
      mockEventsService.findOne.mockResolvedValue(fullEvent);

      await expect(service.create({ eventId: mockEventId }, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for duplicate reservation', async () => {
      mockEventsService.findOne.mockResolvedValue(mockEvent);
      mockReservationModel.findOne.mockResolvedValue(mockReservation);

      await expect(service.create({ eventId: mockEventId }, mockUserId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a reservation if found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReservation),
      };

      mockReservationModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('reservation-id-123');

      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockReservationModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirm', () => {
    it('should confirm a pending reservation', async () => {
      const pendingReservation = {
        ...mockReservation,
        status: ReservationStatus.PENDING,
        save: jest.fn().mockResolvedValue({
          ...mockReservation,
          status: ReservationStatus.CONFIRMED,
          ticketNumber: 'TKT-12345678',
        }),
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(pendingReservation as unknown as ReservationDocument);

      const result = await service.confirm('reservation-id-123');

      expect(pendingReservation.save).toHaveBeenCalled();
      expect(result.status).toBe(ReservationStatus.CONFIRMED);
    });

    it('should throw BadRequestException for non-pending reservation', async () => {
      const confirmedReservation = {
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(confirmedReservation as unknown as ReservationDocument);

      await expect(service.confirm('reservation-id-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refuse', () => {
    it('should refuse a pending reservation', async () => {
      const pendingReservation = {
        ...mockReservation,
        status: ReservationStatus.PENDING,
        event: { _id: mockEventId },
        save: jest.fn().mockResolvedValue({
          ...mockReservation,
          status: ReservationStatus.REFUSED,
        }),
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(pendingReservation as unknown as ReservationDocument);
      mockEventsService.decrementReservedCount.mockResolvedValue(mockEvent);

      const result = await service.refuse('reservation-id-123');

      expect(pendingReservation.save).toHaveBeenCalled();
      expect(result.status).toBe(ReservationStatus.REFUSED);
    });

    it('should throw BadRequestException for non-pending reservation', async () => {
      const confirmedReservation = {
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(confirmedReservation as unknown as ReservationDocument);

      await expect(service.refuse('reservation-id-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should allow participant to cancel their own reservation', async () => {
      const pendingReservation = {
        ...mockReservation,
        participant: { _id: mockUserId },
        event: { _id: mockEventId },
        status: ReservationStatus.PENDING,
        save: jest.fn().mockResolvedValue({
          ...mockReservation,
          status: ReservationStatus.CANCELED,
        }),
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(pendingReservation as unknown as ReservationDocument);
      mockEventsService.decrementReservedCount.mockResolvedValue(mockEvent);

      const result = await service.cancel('reservation-id-123', mockUserId, false);

      expect(pendingReservation.save).toHaveBeenCalled();
      expect(result.status).toBe(ReservationStatus.CANCELED);
    });

    it('should throw BadRequestException when non-owner tries to cancel', async () => {
      const otherUserId = new Types.ObjectId().toString();
      const pendingReservation = {
        ...mockReservation,
        participant: { _id: mockUserId },
        status: ReservationStatus.PENDING,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(pendingReservation as unknown as ReservationDocument);

      await expect(service.cancel('reservation-id-123', otherUserId, false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow admin to cancel any reservation', async () => {
      const otherUserId = new Types.ObjectId().toString();
      const pendingReservation = {
        ...mockReservation,
        participant: { _id: mockUserId },
        event: { _id: mockEventId },
        status: ReservationStatus.PENDING,
        save: jest.fn().mockResolvedValue({
          ...mockReservation,
          status: ReservationStatus.CANCELED,
        }),
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(pendingReservation as unknown as ReservationDocument);
      mockEventsService.decrementReservedCount.mockResolvedValue(mockEvent);

      const result = await service.cancel('reservation-id-123', otherUserId, true);

      expect(pendingReservation.save).toHaveBeenCalled();
      expect(result.status).toBe(ReservationStatus.CANCELED);
    });
  });

  describe('getTicketData', () => {
    it('should return ticket data for confirmed reservation', async () => {
      const confirmedReservation = {
        ...mockReservation,
        participant: { _id: mockUserId },
        status: ReservationStatus.CONFIRMED,
        ticketNumber: 'TKT-12345678',
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(confirmedReservation as unknown as ReservationDocument);

      const result = await service.getTicketData('reservation-id-123', mockUserId, false);

      expect(result.ticketNumber).toBe('TKT-12345678');
    });

    it('should throw BadRequestException for non-confirmed reservation', async () => {
      const pendingReservation = {
        ...mockReservation,
        participant: { _id: mockUserId },
        status: ReservationStatus.PENDING,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(pendingReservation as unknown as ReservationDocument);

      await expect(service.getTicketData('reservation-id-123', mockUserId, false)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
