import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';
import { RolesGuard } from '@app/common/guards';
import { Roles, CurrentUser } from '@app/common/decorators';
import { UserRole } from '@app/common/enums';
import { SERVICES } from '@app/common';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    @Inject(SERVICES.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 202, description: 'Notification queued for sending' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiBearerAuth()
  async sendNotification(@Body() sendNotificationDto: any) {
    return this.notificationService.send(
      { cmd: 'send_notification' },
      sendNotificationDto,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get notification history for current user' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of notifications to retrieve' })
  @ApiResponse({ status: 200, description: 'Notification history retrieved' })
  @ApiBearerAuth()
  async getMyNotificationHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.send(
      { cmd: 'get_notification_history' },
      { recipientId: user.id, limit },
    );
  }

  @Get('history/:recipientId')
  @ApiOperation({ summary: 'Get notification history for a specific user (Admin only)' })
  @ApiParam({ name: 'recipientId', description: 'Recipient user ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of notifications to retrieve' })
  @ApiResponse({ status: 200, description: 'Notification history retrieved' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserNotificationHistory(
    @Param('recipientId') recipientId: string,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.send(
      { cmd: 'get_notification_history' },
      { recipientId, limit },
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiQuery({ name: 'recipientId', required: false, description: 'Filter by recipient ID' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getNotificationStats(
    @Query('recipientId') recipientId?: string,
    @Query('days') days?: number,
  ) {
    return this.notificationService.send(
      { cmd: 'get_notification_stats' },
      { recipientId, days },
    );
  }

  @Post('retry/:notificationId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Retry a failed notification' })
  @ApiParam({ name: 'notificationId', description: 'Notification ID to retry' })
  @ApiResponse({ status: 202, description: 'Notification retry queued' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async retryFailedNotification(@Param('notificationId') notificationId: string) {
    return this.notificationService.send(
      { cmd: 'retry_failed_notification' },
      { notificationId },
    );
  }

  // Template Management Endpoints (proxy to notification service HTTP endpoints)
  
  @Get('templates')
  @ApiOperation({ summary: 'Get all notification templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllTemplates() {
    // This should proxy to the notification service HTTP endpoint
    // For now, we'll use the microservice pattern
    return this.notificationService.send({ cmd: 'get_all_templates' }, {});
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTemplate(@Body() createTemplateDto: any) {
    return this.notificationService.send(
      { cmd: 'create_template' },
      createTemplateDto,
    );
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a notification template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: any,
  ) {
    return this.notificationService.send(
      { cmd: 'update_template' },
      { id, ...updateTemplateDto },
    );
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTemplate(@Param('id') id: string) {
    return this.notificationService.send({ cmd: 'delete_template' }, { id });
  }
}
