import { Controller, Get, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  UpdateUserDto, 
  UserResponseDto, 
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
