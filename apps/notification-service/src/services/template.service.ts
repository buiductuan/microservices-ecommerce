import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from '@app/database/entities/notification-template.entity';
import { NotificationType, NotificationChannel } from '@app/common/enums';

export interface CreateTemplateDto {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: NotificationType;
  channels: NotificationChannel[];
  variables?: Record<string, any>;
}

export interface UpdateTemplateDto {
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  channels?: NotificationChannel[];
  variables?: Record<string, any>;
  isActive?: boolean;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly templateRepository: Repository<NotificationTemplate>,
  ) {}

  async createTemplate(createData: CreateTemplateDto): Promise<NotificationTemplate> {
    try {
      const template = this.templateRepository.create(createData);
      const savedTemplate = await this.templateRepository.save(template);
      
      this.logger.log(`Template created: ${savedTemplate.name}`);
      return savedTemplate;
    } catch (error) {
      this.logger.error('Failed to create template:', error);
      throw error;
    }
  }

  async findAllTemplates(): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findTemplateById(id: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async findTemplateByName(name: string): Promise<NotificationTemplate | null> {
    return this.templateRepository.findOne({
      where: { name, isActive: true },
    });
  }

  async findTemplatesByType(type: NotificationType): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { type, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateTemplate(id: string, updateData: UpdateTemplateDto): Promise<NotificationTemplate> {
    const template = await this.findTemplateById(id);
    
    Object.assign(template, updateData);
    const updatedTemplate = await this.templateRepository.save(template);
    
    this.logger.log(`Template updated: ${updatedTemplate.name}`);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.findTemplateById(id);
    
    // Soft delete by setting isActive to false
    template.isActive = false;
    await this.templateRepository.save(template);
    
    this.logger.log(`Template soft deleted: ${template.name}`);
  }

  async renderTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<{ subject: string; htmlContent: string; textContent?: string }> {
    const template = await this.findTemplateById(templateId);
    
    const rendered = {
      subject: this.replaceVariables(template.subject, variables),
      htmlContent: this.replaceVariables(template.htmlContent, variables),
      textContent: template.textContent ? this.replaceVariables(template.textContent, variables) : undefined,
    };

    return rendered;
  }

  async renderTemplateByName(
    templateName: string,
    variables: Record<string, any>
  ): Promise<{ subject: string; htmlContent: string; textContent?: string }> {
    const template = await this.findTemplateByName(templateName);
    
    if (!template) {
      throw new NotFoundException(`Template with name ${templateName} not found`);
    }

    return this.renderTemplate(template.id, variables);
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });

    return result;
  }

  async seedDefaultTemplates(): Promise<void> {
    const templates = [
      {
        name: 'welcome_email',
        subject: 'Welcome to {{platform_name}}!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome {{user_name}}!</h1>
            <p>Thank you for joining {{platform_name}}. We're excited to have you aboard!</p>
            <p>You can now:</p>
            <ul>
              <li>Browse our product catalog</li>
              <li>Place orders</li>
              <li>Track your shipments</li>
              <li>Manage your account</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The {{platform_name}} Team</p>
          </div>
        `,
        type: NotificationType.WELCOME,
        channels: [NotificationChannel.EMAIL],
      },
      {
        name: 'order_confirmation_email',
        subject: 'Order Confirmation - #{{order_id}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Order Confirmed!</h1>
            <p>Hi {{customer_name}},</p>
            <p>Thank you for your order! Here are the details:</p>
            
            <div style="background: #f9f9f9; padding: 20px; margin: 20px 0;">
              <h3>Order #{{order_id}}</h3>
              <p><strong>Total: \${{total_amount}}</strong></p>
              <p>Items: {{item_count}}</p>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
            <p>Best regards,<br>The {{platform_name}} Team</p>
          </div>
        `,
        type: NotificationType.ORDER_CONFIRMATION,
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      },
      {
        name: 'password_reset_email',
        subject: 'Password Reset Request',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Reset</h1>
            <p>Hi {{user_name}},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{reset_url}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="{{reset_url}}">{{reset_url}}</a></p>
            
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this, please ignore this email.</p>
            
            <p>Best regards,<br>The {{platform_name}} Team</p>
          </div>
        `,
        type: NotificationType.PASSWORD_RESET,
        channels: [NotificationChannel.EMAIL],
      },
    ];

    for (const templateData of templates) {
      const existingTemplate = await this.findTemplateByName(templateData.name);
      
      if (!existingTemplate) {
        await this.createTemplate(templateData);
        this.logger.log(`Seeded template: ${templateData.name}`);
      }
    }
  }
}
