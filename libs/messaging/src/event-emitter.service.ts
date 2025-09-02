import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventPayload } from '@app/common';

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientProxy,
  ) {}

  async emitEvent<T>(eventType: string, data: T, userId?: string): Promise<void> {
    const payload: EventPayload<T> = {
      eventType,
      data,
      timestamp: new Date(),
      userId,
      traceId: this.generateTraceId(),
    };

    try {
      await this.kafkaClient.emit(eventType, payload).toPromise();
      this.logger.log(`Event emitted: ${eventType}`, payload);
    } catch (error) {
      this.logger.error(`Failed to emit event: ${eventType}`, error);
      throw error;
    }
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
