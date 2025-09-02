import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

export interface SmsPayload {
  to: string;
  message: string;
  from?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilio: Twilio;
  private fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');

    if (!accountSid || !authToken) {
      this.logger.warn('Twilio credentials not configured. SMS functionality will be disabled.');
      return;
    }

    try {
      this.twilio = new Twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
    }
  }

  async sendSms(payload: SmsPayload): Promise<{
    success: boolean;
    sid?: string;
    error?: string;
  }> {
    if (!this.twilio) {
      const error = 'Twilio client not initialized';
      this.logger.error(error);
      return { success: false, error };
    }

    try {
      const message = await this.twilio.messages.create({
        body: payload.message,
        from: payload.from || this.fromNumber,
        to: payload.to,
      });

      this.logger.log(`SMS sent successfully to ${payload.to}, SID: ${message.sid}`);
      
      return {
        success: true,
        sid: message.sid,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${payload.to}:`, error);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendWelcomeSms(to: string, userName: string): Promise<any> {
    const message = `Welcome ${userName}! Thank you for joining our platform. Start exploring our products and enjoy your shopping experience!`;
    return this.sendSms({ to, message });
  }

  async sendOrderConfirmationSms(
    to: string,
    orderData: {
      orderId: string;
      customerName: string;
      total: number;
    }
  ): Promise<any> {
    const message = `Hi ${orderData.customerName}! Your order #${orderData.orderId} for $${orderData.total.toFixed(2)} has been confirmed. We'll notify you when it ships.`;
    return this.sendSms({ to, message });
  }

  async sendOrderShippedSms(
    to: string,
    orderData: {
      orderId: string;
      customerName: string;
      trackingNumber?: string;
    }
  ): Promise<any> {
    let message = `Hi ${orderData.customerName}! Your order #${orderData.orderId} has been shipped.`;
    
    if (orderData.trackingNumber) {
      message += ` Track it with: ${orderData.trackingNumber}`;
    }
    
    return this.sendSms({ to, message });
  }

  async sendOrderDeliveredSms(
    to: string,
    orderData: {
      orderId: string;
      customerName: string;
    }
  ): Promise<any> {
    const message = `Great news ${orderData.customerName}! Your order #${orderData.orderId} has been delivered. Thank you for your business!`;
    return this.sendSms({ to, message });
  }

  async sendPasswordResetSms(to: string, resetCode: string, userName: string): Promise<any> {
    const message = `Hi ${userName}, your password reset code is: ${resetCode}. This code will expire in 10 minutes. If you didn't request this, please ignore.`;
    return this.sendSms({ to, message });
  }

  async sendVerificationCodeSms(to: string, verificationCode: string): Promise<any> {
    const message = `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
    return this.sendSms({ to, message });
  }
}
