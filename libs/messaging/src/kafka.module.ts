import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get('KAFKA_CLIENT_ID', 'ecommerce-client'),
              brokers: configService.get('KAFKA_BROKERS', 'localhost:9092').split(','),
              retry: {
                retries: 5,
                initialRetryTime: 300,
                multiplier: 2,
              },
            },
            consumer: {
              groupId: configService.get('KAFKA_GROUP_ID', 'ecommerce-group'),
              retry: {
                retries: 5,
              },
            },
            producer: {
              retry: {
                retries: 5,
              },
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
