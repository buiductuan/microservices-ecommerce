import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationLog } from '@app/database/entities/notification-log.entity';
import { 
  NotificationChannel, 
  NotificationStatus, 
  NotificationPriority,
  NotificationType 
} from '@app/common/enums';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';

export interface SendNotificationDto {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channel: NotificationChannel;
  type?: NotificationType;
  templateId?: string;
  templateName?: string;
  subject?: string;
  content?: string;
  variables?: Record<string, any>;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationEvent {
  type: string;
  data: any;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly templateService: TemplateService,
  ) {}

  @MessagePattern({ cmd: 'send_notification' })
  async sendNotification(@Payload() dto: SendNotificationDto): Promise<{
    success: boolean;
    notificationId: string;
    error?: string;
  }> {
    this.logger.log(`Sending notification to ${dto.recipientId} via ${dto.channel}`);

    // Create notification log entry
    const notificationLog = this.notificationLogRepository.create({
      recipientId: dto.recipientId,
      recipientEmail: dto.recipientEmail,
      recipientPhone: dto.recipientPhone,
      channel: dto.channel,
      status: NotificationStatus.PENDING,
      priority: dto.priority || NotificationPriority.NORMAL,
      subject: dto.subject || '',
      content: dto.content || '',
      metadata: dto.metadata || {},
      scheduledAt: dto.scheduledAt,
      templateId: dto.templateId,
    });

    try {
      // Save initial log
      await this.notificationLogRepository.save(notificationLog);

      // Get content from template if specified
      let subject = dto.subject || '';
      let content = dto.content || '';

      if (dto.templateId || dto.templateName) {
        const rendered = dto.templateId 
          ? await this.templateService.renderTemplate(dto.templateId, dto.variables || {})
          : await this.templateService.renderTemplateByName(dto.templateName!, dto.variables || {});
        
        subject = rendered.subject;
        content = rendered.htmlContent;
      }

      // Update log with rendered content
      notificationLog.subject = subject;
      notificationLog.content = content;

      // Send notification based on channel
      let result: any;
      
      switch (dto.channel) {
        case NotificationChannel.EMAIL:
          if (!dto.recipientEmail) {
            throw new Error('Recipient email is required for email notifications');
          }
          result = await this.emailService.sendEmail({
            to: dto.recipientEmail,
            subject,
            html: content,
          });
          break;

        case NotificationChannel.SMS:
          if (!dto.recipientPhone) {
            throw new Error('Recipient phone is required for SMS notifications');
          }
          result = await this.smsService.sendSms({
            to: dto.recipientPhone,
            message: content.replace(/<[^>]*>/g, ''), // Strip HTML tags
          });
          break;

        default:
          throw new Error(`Unsupported notification channel: ${dto.channel}`);
      }

      // Update notification status
      if (result.success) {
        notificationLog.status = NotificationStatus.SENT;
        notificationLog.sentAt = new Date();
        notificationLog.externalId = result.messageId || result.sid;
      } else {
        notificationLog.status = NotificationStatus.FAILED;
        notificationLog.errorMessage = result.error;
      }

      await this.notificationLogRepository.save(notificationLog);

      return {
        success: result.success,
        notificationId: notificationLog.id,
        error: result.error,
      };

    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      
      notificationLog.status = NotificationStatus.FAILED;
      notificationLog.errorMessage = error.message;
      await this.notificationLogRepository.save(notificationLog);

      return {
        success: false,
        notificationId: notificationLog.id,
        error: error.message,
      };
    }
  }

  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: any): Promise<void> {
    this.logger.log('Handling user created event', data);

    const { userId, email, name } = data;

    // Send welcome email
    await this.sendNotification({
      recipientId: userId,
      recipientEmail: email,
      channel: NotificationChannel.EMAIL,
      templateName: 'welcome_email',
      variables: {
        user_name: name,
        platform_name: 'E-commerce Platform',
      },
      priority: NotificationPriority.HIGH,
    });
  }

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: any): Promise<void> {
    this.logger.log('Handling order created event', data);

    const { orderId, userId, userEmail, userName, totalAmount, items } = data;

    // Send order confirmation email
    await this.sendNotification({
      recipientId: userId,
      recipientEmail: userEmail,
      channel: NotificationChannel.EMAIL,
      templateName: 'order_confirmation_email',
      variables: {
        customer_name: userName,
        order_id: orderId,
        total_amount: totalAmount,
        item_count: items?.length || 0,
        platform_name: 'E-commerce Platform',
      },
      priority: NotificationPriority.HIGH,
    });
  }

  @EventPattern('order.shipped')
  async handleOrderShipped(@Payload() data: any): Promise<void> {
    this.logger.log('Handling order shipped event', data);

    const { orderId, userId, userEmail, userName, trackingNumber } = data;

    await this.sendNotification({
      recipientId: userId,
      recipientEmail: userEmail,
      channel: NotificationChannel.EMAIL,
      subject: `Order #${orderId} Shipped`,
      content: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Your order is on its way!</h2>
          <p>Hi ${userName},</p>
          <p>Great news! Your order #${orderId} has been shipped.</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          <p>Thank you for your business!</p>
        </div>
      `,
      priority: NotificationPriority.NORMAL,
    });
  }

  @EventPattern('password.reset.requested')
  async handlePasswordResetRequested(@Payload() data: any): Promise<void> {
    this.logger.log('Handling password reset requested event', data);

    const { userId, userEmail, userName, resetToken } = data;

    await this.sendNotification({
      recipientId: userId,
      recipientEmail: userEmail,
      channel: NotificationChannel.EMAIL,
      templateName: 'password_reset_email',
      variables: {
        user_name: userName,
        reset_url: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        platform_name: 'E-commerce Platform',
      },
      priority: NotificationPriority.HIGH,
    });
  }

  @MessagePattern({ cmd: 'get_notification_history' })
  async getNotificationHistory(@Payload() data: { recipientId: string; limit?: number }): Promise<NotificationLog[]> {
    const { recipientId, limit = 50 } = data;

    return this.notificationLogRepository.find({
      where: { recipientId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['template'],
    });
  }

  @MessagePattern({ cmd: 'get_notification_stats' })
  async getNotificationStats(@Payload() data: { recipientId?: string; days?: number }): Promise<any> {
    const { recipientId, days = 30 } = data;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const queryBuilder = this.notificationLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt >= :since', { since });

    if (recipientId) {
      queryBuilder.andWhere('log.recipientId = :recipientId', { recipientId });
    }

    const [total, sent, failed, pending] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.andWhere('log.status = :status', { status: NotificationStatus.SENT }).getCount(),
      queryBuilder.andWhere('log.status = :status', { status: NotificationStatus.FAILED }).getCount(),
      queryBuilder.andWhere('log.status = :status', { status: NotificationStatus.PENDING }).getCount(),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
    };
  }

  @MessagePattern({ cmd: 'retry_failed_notification' })
  async retryFailedNotification(@Payload() data: { notificationId: string }): Promise<any> {
    const { notificationId } = data;
    
    const notification = await this.notificationLogRepository.findOne({
      where: { id: notificationId, status: NotificationStatus.FAILED },
    });

    if (!notification) {
      return { success: false, error: 'Notification not found or not in failed status' };
    }

    // Increment retry count
    notification.retryCount += 1;
    notification.status = NotificationStatus.PENDING;
    notification.errorMessage = null;
    
    await this.notificationLogRepository.save(notification);

    // Retry sending
    return this.sendNotification({
      recipientId: notification.recipientId,
      recipientEmail: notification.recipientEmail,
      recipientPhone: notification.recipientPhone,
      channel: notification.channel,
      subject: notification.subject,
      content: notification.content,
      priority: notification.priority,
      metadata: notification.metadata,
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('NotificationService initialized');
    
    // Seed default templates
    try {
      await this.templateService.seedDefaultTemplates();
    } catch (error) {
      this.logger.error('Failed to seed default templates:', error);
    }
  }
}
