import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  CreateOrderDto,
  UpdateOrderDto,
  OrderResponseDto,
  OrderStatsDto,
  PaginationDto,
  MESSAGE_PATTERNS,
  SERVICES,
  JwtAuthGuard,
  RolesGuard,
  Roles,
  UserRole,
  CurrentUser,
  JwtPayload 
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    @Inject(SERVICES.ORDER_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    const result = await firstValueFrom(
      this.orderClient.send(MESSAGE_PATTERNS.ORDER_CREATE, {
        ...createOrderDto,
        userId: user.sub,
      })
    );
    return result.data;
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await firstValueFrom(
      this.orderClient.send(MESSAGE_PATTERNS.ORDER_FIND_BY_USER, {
        userId: user.sub,
        ...paginationDto,
      })
    );
    return result.data;
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  async getOrderStats(): Promise<OrderStatsDto> {
    const result = await firstValueFrom(
      this.orderClient.send(MESSAGE_PATTERNS.ORDER_GET_STATS, {})
    );
    return result.data;
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    const result = await firstValueFrom(
      this.orderClient.send(MESSAGE_PATTERNS.ORDER_FIND_BY_ID, {
        id,
        userId: user.sub,
      })
    );
    return result.data;
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const result = await firstValueFrom(
      this.orderClient.send(MESSAGE_PATTERNS.ORDER_UPDATE_STATUS, {
        id,
        ...updateOrderDto,
      })
    );
    return result.data;
  }
}
