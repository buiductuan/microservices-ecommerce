import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/database';
import { KafkaModule } from '@app/messaging';
import { UserModule } from './user/user.module';
import { User } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    KafkaModule,
    TypeOrmModule.forFeature([User]),
    UserModule,
  ],
})
export class AppModule {}
