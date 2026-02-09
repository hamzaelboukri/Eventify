import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { EventStatus } from '../src/modules/events/schemas/event.schema';
import { UserRole } from '../src/modules/users/schemas/user.schema';

describe('Events (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let jwtService: JwtService;
  let adminToken: string;
  let participantToken: string;
  let adminUserId: string;

  let createdEventId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('MONGODB_URI')
      .useValue(uri)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('Authentication setup', () => {
    it('should register an admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'AdminPass123!',
        })
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.access_token).toBeDefined();
      adminUserId = response.body.user.id;

      // Note: In real scenario, admin role would be set differently
      // For testing, we create the token directly
      adminToken = jwtService.sign({
        sub: adminUserId,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });
    });

    it('should register a participant user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Participant User',
          email: 'participant@test.com',
          password: 'ParticipantPass123!',
        })
        .expect(201);

      expect(response.body.user).toBeDefined();
      participantUserId = response.body.user.id;
      participantToken = response.body.access_token;
    });
  });

  describe('Event CRUD Operations', () => {
    const createEventDto = {
      title: 'Test Formation React',
      description: 'Une formation complète sur React avec hooks et patterns avancés',
      date: '2026-06-15',
      time: '09:00',
      location: 'Salle A - Centre de formation',
      capacity: 25,
      category: 'Formation',
      price: 'Gratuit',
    };

    describe('POST /events', () => {
      it('should reject event creation without authentication', async () => {
        await request(app.getHttpServer())
          .post('/events')
          .send(createEventDto)
          .expect(401);
      });

      it('should reject event creation by participant', async () => {
        await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${participantToken}`)
          .send(createEventDto)
          .expect(403);
      });

      it('should create an event as admin', async () => {
        const response = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(createEventDto)
          .expect(201);

        expect(response.body.title).toBe(createEventDto.title);
        expect(response.body.description).toBe(createEventDto.description);
        expect(response.body.status).toBe(EventStatus.DRAFT);
        expect(response.body.capacity).toBe(createEventDto.capacity);
        expect(response.body.reservedSpots).toBe(0);
        expect(response.body.id).toBeDefined();
        createdEventId = response.body.id;
      });

      it('should reject event creation with invalid data', async () => {
        const invalidEvent = {
          title: 'AB', // Too short
          description: 'Short', // Too short
          date: 'invalid-date',
          time: '',
          location: '',
          capacity: 0, // Invalid
        };

        const response = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidEvent)
          .expect(400);

        expect(response.body.message).toBeInstanceOf(Array);
      });
    });

    describe('GET /events', () => {
      it('should return empty list for published events (event is draft)', async () => {
        const response = await request(app.getHttpServer())
          .get('/events')
          .expect(200);

        expect(response.body.events).toBeDefined();
        expect(Array.isArray(response.body.events)).toBe(true);
      });
    });

    describe('GET /events/admin/all', () => {
      it('should reject access without authentication', async () => {
        await request(app.getHttpServer())
          .get('/events/admin/all')
          .expect(401);
      });

      it('should reject access by participant', async () => {
        await request(app.getHttpServer())
          .get('/events/admin/all')
          .set('Authorization', `Bearer ${participantToken}`)
          .expect(403);
      });

      it('should return all events for admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/events/admin/all')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.events).toBeDefined();
        expect(response.body.total).toBeGreaterThanOrEqual(1);
        expect(response.body.events.some((e: any) => e.id === createdEventId)).toBe(true);
      });
    });

    describe('GET /events/:id', () => {
      it('should return 404 for draft event (public access)', async () => {
        await request(app.getHttpServer())
          .get(`/events/${createdEventId}`)
          .expect(404);
      });
    });

    describe('GET /events/admin/:id', () => {
      it('should return event for admin', async () => {
        const response = await request(app.getHttpServer())
          .get(`/events/admin/${createdEventId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.id).toBe(createdEventId);
        expect(response.body.status).toBe(EventStatus.DRAFT);
      });
    });

    describe('PATCH /events/:id/publish', () => {
      it('should reject publish by participant', async () => {
        await request(app.getHttpServer())
          .patch(`/events/${createdEventId}/publish`)
          .set('Authorization', `Bearer ${participantToken}`)
          .expect(403);
      });

      it('should publish event as admin', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/events/${createdEventId}/publish`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).toBe(EventStatus.PUBLISHED);
      });

      it('should reject publishing already published event', async () => {
        await request(app.getHttpServer())
          .patch(`/events/${createdEventId}/publish`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });
    });

    describe('GET /events/:id (published)', () => {
      it('should return published event publicly', async () => {
        const response = await request(app.getHttpServer())
          .get(`/events/${createdEventId}`)
          .expect(200);

        expect(response.body.id).toBe(createdEventId);
        expect(response.body.status).toBe(EventStatus.PUBLISHED);
      });
    });

    describe('GET /events/:id/availability', () => {
      it('should return availability for published event', async () => {
        const response = await request(app.getHttpServer())
          .get(`/events/${createdEventId}/availability`)
          .expect(200);

        expect(response.body.available).toBe(true);
        expect(response.body.availableSpots).toBe(25);
      });
    });

    describe('PUT /events/:id', () => {
      it('should update event as admin', async () => {
        const updateDto = {
          title: 'Updated Formation React Avancé',
          capacity: 30,
        };

        const response = await request(app.getHttpServer())
          .put(`/events/${createdEventId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.title).toBe(updateDto.title);
        expect(response.body.capacity).toBe(updateDto.capacity);
      });

      it('should reject update by participant', async () => {
        await request(app.getHttpServer())
          .put(`/events/${createdEventId}`)
          .set('Authorization', `Bearer ${participantToken}`)
          .send({ title: 'Hacked Title' })
          .expect(403);
      });
    });

    describe('PATCH /events/:id/cancel', () => {
      it('should cancel event as admin', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/events/${createdEventId}/cancel`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).toBe(EventStatus.CANCELED);
      });

      it('should reject canceling already canceled event', async () => {
        await request(app.getHttpServer())
          .patch(`/events/${createdEventId}/cancel`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });
    });

    describe('GET /events (after cancel)', () => {
      it('should not return canceled event in public list', async () => {
        const response = await request(app.getHttpServer())
          .get('/events')
          .expect(200);

        const foundEvent = response.body.events.find((e: any) => e.id === createdEventId);
        expect(foundEvent).toBeUndefined();
      });
    });

    describe('GET /events/stats', () => {
      it('should return stats for admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/events/stats')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.totalEvents).toBeDefined();
        expect(response.body.canceledEvents).toBeGreaterThanOrEqual(1);
      });
    });

    describe('DELETE /events/:id', () => {
      let eventToDeleteId: string;

      beforeAll(async () => {
        // Create a new event without reservations for deletion test
        const response = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'Event To Delete',
            description: 'This event will be deleted for testing purposes',
            date: '2026-07-15',
            time: '10:00',
            location: 'Test Location',
            capacity: 10,
          });
        eventToDeleteId = response.body.id;
      });

      it('should reject deletion by participant', async () => {
        await request(app.getHttpServer())
          .delete(`/events/${eventToDeleteId}`)
          .set('Authorization', `Bearer ${participantToken}`)
          .expect(403);
      });

      it('should delete event as admin', async () => {
        await request(app.getHttpServer())
          .delete(`/events/${eventToDeleteId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/events/admin/${eventToDeleteId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });
  });

  describe('Event Categories', () => {
    it('should return categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Upcoming Events', () => {
    beforeAll(async () => {
      // Create some published events for upcoming
      const futureEvent = {
        title: 'Future Event',
        description: 'An upcoming event for testing the upcoming endpoint',
        date: '2027-01-15',
        time: '14:00',
        location: 'Future Location',
        capacity: 50,
        status: EventStatus.PUBLISHED,
      };

      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(futureEvent);
    });

    it('should return upcoming events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/upcoming?limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
