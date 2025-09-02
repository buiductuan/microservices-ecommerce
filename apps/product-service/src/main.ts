import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('ProductService');
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST || 'localhost',
        port: parseInt(process.env.PORT) || 3002,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllRpcExceptionFilter());

  await app.listen();
  logger.log(`🚀 Product Service is running on TCP port ${process.env.PORT || 3002}`);
}

bootstrap();
