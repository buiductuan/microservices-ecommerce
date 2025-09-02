import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationModule } from './notification.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('NotificationService');

  // Create HTTP server for health checks and API documentation
  const app = await NestFactory.create(NotificationModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Microservice for handling email and SMS notifications')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start HTTP server
  const port = configService.get('PORT', 3004);
  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);

  // Create microservice for Kafka
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notification-service',
          brokers: [configService.get('KAFKA_BROKERS', 'localhost:9092')],
        },
        consumer: {
          groupId: 'notification-service-consumer',
        },
      },
    },
  );

  await microservice.listen();
  logger.log('Kafka microservice is listening...');
}

bootstrap().catch((error) => {
  console.error('Error starting notification service:', error);
  process.exit(1);
});
