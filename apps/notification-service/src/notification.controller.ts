import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
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
import { Roles } from '@app/common/decorators';
import { UserRole } from '@app/common/enums';
import { NotificationService } from './notification.service';
import { TemplateService } from './services/template.service';
import { 
  SendNotificationDto, 
  CreateTemplateDto, 
  UpdateTemplateDto, 
  RenderTemplateDto 
} from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly templateService: TemplateService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 202, description: 'Notification queued for sending' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiBearerAuth()
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationService.sendNotification(sendNotificationDto);
  }

  @Get('history/:recipientId')
  @ApiOperation({ summary: 'Get notification history for a recipient' })
  @ApiParam({ name: 'recipientId', description: 'Recipient user ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of notifications to retrieve' })
  @ApiResponse({ status: 200, description: 'Notification history retrieved' })
  @ApiBearerAuth()
  async getNotificationHistory(
    @Param('recipientId') recipientId: string,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.getNotificationHistory({ recipientId, limit });
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
    return this.notificationService.getNotificationStats({ recipientId, days });
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
    return this.notificationService.retryFailedNotification({ notificationId });
  }

  // Template Management Endpoints

  @Get('templates')
  @ApiOperation({ summary: 'Get all notification templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllTemplates() {
    return this.templateService.findAllTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a notification template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTemplateById(@Param('id') id: string) {
    return this.templateService.findTemplateById(id);
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templateService.createTemplate(createTemplateDto);
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
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templateService.updateTemplate(id, updateTemplateDto);
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
    await this.templateService.deleteTemplate(id);
  }

  @Post('templates/:id/render')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Render a template with variables' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template rendered successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async renderTemplate(
    @Param('id') id: string,
    @Body() renderTemplateDto: RenderTemplateDto,
  ) {
    return this.templateService.renderTemplate(id, renderTemplateDto.variables);
  }
}
