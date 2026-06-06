import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { hashPassword } from '@common/utils';

/**
 * Service responsible for user CRUD operations.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Returns a paginated list of all users.
   *
   * @param page  - 1-based page number
   * @param limit - Items per page
   * @returns Object containing items array, total count, and pagination metadata
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: UserResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const [users, total] = await this.userRepository.base.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: users.map((u) => plainToInstance(UserResponseDto, u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Finds a single user by their UUID.
   *
   * @param id - User UUID
   * @returns The user entity or null
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.base.findOne({ where: { id } });
  }

  /**
   * Finds a single user by their email address.
   *
   * @param email - User email
   * @returns The user entity or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.base.findOne({ where: { email } });
  }

  /**
   * Creates a new user with a hashed password.
   *
   * @param dto - The creation payload
   * @returns The newly created user
   * @throws ConflictException if the email is already registered
   */
  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPw = await hashPassword(dto.password);

    const user = this.userRepository.base.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash: hashedPw,
      firstName: dto.firstName,
      lastName: dto.lastName,
      organizationId: dto.organizationId ?? null,
      status: 'PENDING_VERIFICATION',
      emailVerified: false,
    });

    const saved = await this.userRepository.base.save(user);
    this.logger.log(`User created: ${saved.id} (${saved.email})`);
    return saved;
  }

  /**
   * Updates user fields by ID.
   *
   * @param id  - User UUID
   * @param dto - Fields to update
   * @returns The updated user entity
   * @throws NotFoundException if user does not exist
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.base.save(user);
    this.logger.log(`User updated: ${saved.id}`);
    return saved;
  }

  /**
   * Soft-deactivates a user by setting their status to DEACTIVATED.
   *
   * @param id - User UUID
   * @returns The deactivated user entity
   * @throws NotFoundException if user does not exist
   */
  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    user.status = 'DEACTIVATED';
    const saved = await this.userRepository.base.save(user);
    this.logger.log(`User deactivated: ${saved.id}`);

    // Invalidate all active sessions
    await this.sessionRepository.update(
      { userId: id, isActive: true },
      { isActive: false },
    );

    return saved;
  }

  /**
   * Updates the user's avatar URL.
   *
   * @param id        - User UUID
   * @param avatarUrl - New avatar URL
   * @returns The updated user entity
   * @throws NotFoundException if user does not exist
   */
  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    user.avatarUrl = avatarUrl;
    return this.userRepository.base.save(user);
  }
}
