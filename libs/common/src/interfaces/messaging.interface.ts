export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId?: string;
  retry?: {
    retries: number;
    initialRetryTime: number;
    maxRetryTime: number;
  };
}

export interface RabbitMQConfig {
  urls: string[];
  queue: string;
  queueOptions?: {
    durable?: boolean;
    persistent?: boolean;
  };
}

export interface EventPayload<T = any> {
  eventType: string;
  data: T;
  timestamp: Date;
  userId?: string;
  traceId?: string;
}
