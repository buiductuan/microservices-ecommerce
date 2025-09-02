import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationChannel, NotificationStatus } from '@app/common/enums';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP server ready');
      }
    });
  }

  async sendEmail(payload: EmailPayload): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', this.configService.get<string>('SMTP_USER', '')),
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        cc: payload.cc,
        bcc: payload.bcc,
        attachments: payload.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully to ${payload.to}, MessageId: ${info?.messageId || 'unknown'}`);
      
      return {
        success: true,
        messageId: info?.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${payload.to}:`, error);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<any> {
    const subject = 'Welcome to Our Platform!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome ${userName}!</h1>
        <p>Thank you for joining our platform. We're excited to have you aboard!</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our product catalog</li>
          <li>Place orders</li>
          <li>Track your shipments</li>
          <li>Manage your account</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendOrderConfirmationEmail(
    to: string,
    orderData: {
      orderId: string;
      customerName: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
    }
  ): Promise<any> {
    const subject = `Order Confirmation - #${orderData.orderId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmed!</h1>
        <p>Hi ${orderData.customerName},</p>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0;">
          <h3>Order #${orderData.orderId}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <th style="text-align: left; padding: 8px;">Item</th>
              <th style="text-align: center; padding: 8px;">Qty</th>
              <th style="text-align: right; padding: 8px;">Price</th>
            </tr>
            ${orderData.items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px;">${item.name}</td>
                <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                <td style="text-align: right; padding: 8px;">$${item.price.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="border-top: 2px solid #333; font-weight: bold;">
              <td colspan="2" style="padding: 8px;">Total:</td>
              <td style="text-align: right; padding: 8px;">$${orderData.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<any> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, please ignore this email.</p>
        
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }
}
