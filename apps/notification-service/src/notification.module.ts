import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';
import { NotificationTemplate } from '@app/database/entities/notification-template.entity';
import { NotificationLog } from '@app/database/entities/notification-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'notification_db'),
        entities: [NotificationTemplate, NotificationLog],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    
    TypeOrmModule.forFeature([NotificationTemplate, NotificationLog]),
    
    // Kafka Client
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'notification-service-client',
              brokers: [configService.get('KAFKA_BROKERS', 'localhost:9092')],
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailService,
    SmsService,
    TemplateService,
  ],
})
export class NotificationModule {}
