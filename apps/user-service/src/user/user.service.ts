import { Injectable, ConflictException, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { User } from '@app/database';
import { CreateUserDto, UpdateUserDto, UserResponseDto, FindUsersDto, PaginationResponseDto, EVENT_PATTERNS } from '@app/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Emit user created event
    this.kafkaClient.emit('user.created', {
      userId: savedUser.id,
      email: savedUser.email,
      name: savedUser.firstName + ' ' + savedUser.lastName,
    });

    return this.toResponseDto(savedUser);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  async findAll(findUsersDto: FindUsersDto): Promise<PaginationResponseDto<UserResponseDto>> {
    const { page = 1, limit = 10, search, role } = findUsersDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Apply role filter
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const users = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const pages = Math.ceil(total / limit);

    return {
      data: users.map(user => this.toResponseDto(user)),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrevious: page > 1,
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Emit user updated event
    this.kafkaClient.emit('user.updated', {
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.firstName + ' ' + updatedUser.lastName,
    });

    return this.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async validateUser(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    return this.toResponseDto(user);
  }

  private toResponseDto(user: User): UserResponseDto {
    const { password, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }
}
