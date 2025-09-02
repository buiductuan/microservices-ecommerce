import { IsString, IsEmail, IsOptional, IsEnum, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NotificationChannel, NotificationPriority, NotificationType } from '@app/common/enums';

export class SendNotificationDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsString()
  recipientId: string;

  @ApiPropertyOptional({ description: 'Recipient email address' })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Recipient phone number' })
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiProperty({ 
    description: 'Notification channel',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiPropertyOptional({ 
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.ORDER_CONFIRMATION
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Template ID to use' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Template name to use' })
  @IsOptional()
  @IsString()
  templateName?: string;

  @ApiPropertyOptional({ description: 'Notification subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Notification content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ 
    description: 'Variables for template rendering',
    example: { userName: 'John Doe', orderId: '12345' }
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Notification priority',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: 'Schedule notification for later' })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  scheduledAt?: Date;

  @ApiPropertyOptional({ 
    description: 'Additional metadata',
    example: { source: 'api', campaignId: 'welcome-2024' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name (unique)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email subject template' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'HTML content template' })
  @IsString()
  htmlContent: string;

  @ApiPropertyOptional({ description: 'Plain text content template' })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({ 
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.WELCOME
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ 
    description: 'Supported channels',
    enum: NotificationChannel,
    isArray: true,
    example: [NotificationChannel.EMAIL, NotificationChannel.SMS]
  })
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiPropertyOptional({ 
    description: 'Template variables schema',
    example: { userName: 'string', orderId: 'string' }
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: 'Email subject template' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'HTML content template' })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({ description: 'Plain text content template' })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({ 
    description: 'Supported channels',
    enum: NotificationChannel,
    isArray: true
  })
  @IsOptional()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Template variables schema' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template active status' })
  @IsOptional()
  isActive?: boolean;
}

export class RenderTemplateDto {
  @ApiProperty({ 
    description: 'Variables to render template with',
    example: { userName: 'John Doe', orderId: '12345', totalAmount: '99.99' }
  })
  @IsObject()
  variables: Record<string, any>;
}
