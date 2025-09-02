import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { KafkaModule } from '@app/messaging';

@Module({
  imports: [TypeOrmModule.forFeature([User]), KafkaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
