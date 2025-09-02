import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@app/database';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { KafkaModule } from '@app/messaging';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), KafkaModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
