import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderModule } from './order.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('OrderService');

  // Create HTTP server for health checks and API documentation
  const app = await NestFactory.create(OrderModule);
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
    .setTitle('Order Service API')
    .setDescription('Microservice for handling order management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start HTTP server
  const port = configService.get('PORT', 3003);
  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);

  // Create microservice for TCP
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: configService.get('TCP_PORT', 3003),
      },
    },
  );

  await microservice.listen();
  logger.log('TCP microservice is listening...');
}

bootstrap().catch((error) => {
  console.error('Error starting order service:', error);
  process.exit(1);
});
