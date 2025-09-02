import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  getHello(): string {
    return 'Order Service is running!';
  }
}
