import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/database';
import { KafkaModule } from '@app/messaging';
import { ProductModule } from './product/product.module';
import { Product } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    KafkaModule,
    TypeOrmModule.forFeature([Product]),
    ProductModule,
  ],
})
export class AppModule {}
