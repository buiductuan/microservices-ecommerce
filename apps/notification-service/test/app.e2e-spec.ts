import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationModule } from '../src/notification.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationTemplate } from '@app/database/entities/notification-template.entity';
import { NotificationLog } from '@app/database/entities/notification-log.entity';

describe('NotificationController (e2e)', () => {
  let app: INestApplication;

  const mockTemplateRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLogRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule],
    })
      .overrideProvider(getRepositoryToken(NotificationTemplate))
      .useValue(mockTemplateRepository)
      .overrideProvider(getRepositoryToken(NotificationLog))
      .useValue(mockLogRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/notifications/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/notifications/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'OK');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('/notifications/send (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/notifications/send')
        .send({
          recipientId: 'user-123',
          recipientEmail: 'test@example.com',
          channel: 'email',
          subject: 'Test',
          content: 'Test notification',
        })
        .expect(401);
    });
  });
});
