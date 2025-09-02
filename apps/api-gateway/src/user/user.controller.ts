import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { 
  UpdateUserDto, 
  UserResponseDto,
  FindUsersDto,
  PaginationResponseDto,
  UserRole,
  MESSAGE_PATTERNS, 
  SERVICES,
  JwtAuthGuard,
  CurrentUser,
  JwtPayload 
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    @Inject(SERVICES.USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by user role' })
  async getUsers(@Query() findUsersDto: FindUsersDto): Promise<PaginationResponseDto<UserResponseDto>> {
    const result = await firstValueFrom(
      this.userClient.send(MESSAGE_PATTERNS.USER_FIND_ALL, findUsersDto)
    );
    return result.data;
  }

  @Get('profile')
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    const result = await firstValueFrom(
      this.userClient.send(MESSAGE_PATTERNS.USER_FIND_BY_ID, user.sub)
    );
    return result.data;
  }

  @Put('profile')
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const result = await firstValueFrom(
      this.userClient.send(MESSAGE_PATTERNS.USER_UPDATE, {
        id: user.sub,
        ...updateUserDto,
      })
    );
    return result.data;
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const result = await firstValueFrom(
      this.userClient.send(MESSAGE_PATTERNS.USER_FIND_BY_ID, id)
    );
    return result.data;
  }

  @Delete('profile')
  @ApiResponse({ status: 200, description: 'User account deleted successfully' })
  async deleteAccount(@CurrentUser() user: JwtPayload): Promise<void> {
    await firstValueFrom(
      this.userClient.send(MESSAGE_PATTERNS.USER_DELETE, user.sub)
    );
  }
}
