import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let participantToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    const testEmail = `test${Date.now()}@example.com`;

    it('POST /api/auth/register - should register a new participant', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: testEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user).toHaveProperty('email', testEmail);
          expect(res.body.user).toHaveProperty('role', 'participant');
          participantToken = res.body.access_token;
        });
    });

    it('POST /api/auth/login - should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('POST /api/auth/login - should fail with wrong credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('POST /api/auth/register - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: testEmail,
          password: 'password123',
        })
        .expect(409);
    });
  });

  describe('Protected Routes', () => {
    it('GET /api/auth/me - should require authentication', () => {
      return request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('GET /api/auth/me - should return user profile with token', async () => {
      // First login to get token
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: `test${Date.now()}2@example.com`.replace(/2@/, '@'),
          password: 'password123',
        });

      if (loginRes.body.access_token) {
        return request(app.getHttpServer())
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${loginRes.body.access_token}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('email');
          });
      }
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
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('POST /api/auth/register - should validate password length', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: '12345',
        })
        .expect(400);
    });
  });
});
