import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let participantToken: string;

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

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('Authentication', () => {
    it('POST /api/auth/register - should register a new participant', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user).toHaveProperty('email', 'john@example.com');
          expect(res.body.user).toHaveProperty('role', 'participant');
          participantToken = res.body.accessToken;
        });
    });

    it('POST /api/auth/register - should register an admin (for testing)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'admin123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('POST /api/auth/login - should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('POST /api/auth/login - should fail with wrong credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('POST /api/auth/register - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(409);
    });
  });

  describe('Events (Public)', () => {
    it('GET /api/events/public - should return empty list initially', () => {
      return request(app.getHttpServer())
        .get('/api/events/public')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
        });
    });
  });

  describe('Protected Routes', () => {
    it('GET /api/users/profile - should require authentication', () => {
      return request(app.getHttpServer()).get('/api/users/profile').expect(401);
    });

    it('GET /api/users/profile - should return user profile with token', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', 'john@example.com');
        });
    });
  });

  describe('Validation', () => {
    it('POST /api/auth/register - should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('POST /api/auth/register - should validate email format', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('POST /api/auth/register - should validate password length', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);
    });
  });
});
