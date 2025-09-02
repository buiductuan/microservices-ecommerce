import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto, LoginDto, UserResponseDto, MESSAGE_PATTERNS, SERVICES } from '@app/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SERVICES.USER_SERVICE) private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const result = await firstValueFrom(
        this.userClient.send(MESSAGE_PATTERNS.USER_CREATE, createUserDto)
      );
      
      if (result.error) {
        throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
      }
      
      return result.data;
    } catch (error) {
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<{ user: UserResponseDto; token: string }> {
    try {
      const result = await firstValueFrom(
        this.userClient.send(MESSAGE_PATTERNS.USER_VALIDATE, loginDto)
      );
      
      if (result.error) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      
      const user = result.data;
      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = this.jwtService.sign(payload);
      
      return { user, token };
    } catch (error) {
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
