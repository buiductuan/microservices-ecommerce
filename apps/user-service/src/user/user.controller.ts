import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { 
  CreateUserDto, 
  LoginDto, 
  UpdateUserDto, 
  UserResponseDto,
  FindUsersDto,
  PaginationResponseDto,
  MESSAGE_PATTERNS,
  ServiceResponse 
} from '@app/common';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @MessagePattern(MESSAGE_PATTERNS.USER_CREATE)
  async createUser(@Payload() createUserDto: CreateUserDto): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const user = await this.userService.create(createUserDto);
      return { success: true, data: user };
    } catch (error) {
      this.logger.error('Failed to create user', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.USER_FIND_BY_ID)
  async findUserById(@Payload() id: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const user = await this.userService.findById(id);
      return { success: true, data: user };
    } catch (error) {
      this.logger.error('Failed to find user by ID', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.USER_FIND_BY_EMAIL)
  async findUserByEmail(@Payload() email: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const user = await this.userService.findByEmail(email);
      return { success: true, data: user };
    } catch (error) {
      this.logger.error('Failed to find user by email', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.USER_FIND_ALL)
  async findAllUsers(@Payload() findUsersDto: FindUsersDto): Promise<ServiceResponse<PaginationResponseDto<UserResponseDto>>> {
    try {
      const result = await this.userService.findAll(findUsersDto);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Failed to find users', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.USER_UPDATE)
  async updateUser(@Payload() payload: { id: string } & UpdateUserDto): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const { id, ...updateData } = payload;
      const user = await this.userService.update(id, updateData);
      return { success: true, data: user };
    } catch (error) {
      this.logger.error('Failed to update user', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.USER_DELETE)
  async deleteUser(@Payload() id: string): Promise<ServiceResponse<void>> {
    try {
      await this.userService.delete(id);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete user', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.USER_VALIDATE)
  async validateUser(@Payload() loginDto: LoginDto): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const user = await this.userService.validateUser(loginDto.email, loginDto.password);
      return { success: true, data: user };
    } catch (error) {
      this.logger.error('Failed to validate user', error);
      return { success: false, error: error.message };
    }
  }
}
