import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationTemplate {
  WELCOME = 'welcome',
  ORDER_CONFIRMATION = 'order_confirmation',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_VERIFICATION = 'account_verification',
}

export class SendNotificationDto {
  @IsString()
  recipient: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  subject?: string;
}

export class NotificationResponseDto {
  id: string;
  recipient: string;
  type: NotificationType;
  template: NotificationTemplate;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  sentAt?: Date;
  createdAt: Date;
}
