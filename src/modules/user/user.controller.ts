import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_EMAIL_NOTIFICATION } from '@common/queue/queue.constants';
import { generateRandomToken } from '@common/utils/hash.util';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RbacService } from '@modules/rbac/rbac.service';

/**
 * REST controller for user profile and admin-level user management.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rbacService: RbacService,
    private readonly queueService: QueueService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user (admin only).
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new user (admin)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    let roleName: string | undefined;
    if (dto.roleId) {
      // Resolve role: if roleId is a name (e.g. 'org_admin'), look up the real UUID
      let resolvedRoleId = dto.roleId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.roleId);
      if (!isUuid) {
        roleName = dto.roleId;
        const role = await this.rbacService.getRoleByName(dto.roleId);
        if (role) resolvedRoleId = role.id;
      }
      await this.rbacService.assignRoleToUser({ userId: user.id, roleId: resolvedRoleId }, dto.organizationId);
    }

    // Generate verification token and send email (same flow as auth/register)
    const verificationToken = generateRandomToken();
    user.emailVerificationToken = verificationToken;
    await this.userRepository.save(user);

    // Queue verification email (fire-and-forget)
    this.queueService.publish(QUEUE_EMAIL_NOTIFICATION, {
      userId: user.id,
      type: 'VERIFY_EMAIL',
      token: verificationToken,
      email: dto.email,
    }).catch((err) => console.error('Failed to queue verification email:', err));

    return {
      success: true,
      data: plainToInstance(UserResponseDto, user),
    };
  }

  /**
   * List all users with pagination (admin only).
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.userService.findAll(Number(page), Number(limit));
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get the currently authenticated user's profile.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponseDto })
  async getMe(@CurrentUser() currentUser: any) {
    const user = await this.userService.findById(currentUser.id);
    const userPermissions = await this.rbacService.getUserPermissions(currentUser.id);
    const permissions = userPermissions.map(p => `${p.resource}:${p.action}`);
    
    // Get roles for string representation in UI
    const roles = await this.rbacService.getUserRoles(currentUser.id);
    const roleString = roles.length > 0 ? (await this.rbacService.getRole(roles[0].roleId)).name : 'user';

    const dto = plainToInstance(UserResponseDto, user);
    dto.role = roleString;
    dto.permissions = permissions;

    return {
      success: true,
      data: dto,
    };
  }

  /**
   * Update the currently authenticated user's profile.
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: UserResponseDto })
  async updateMe(
    @CurrentUser() currentUser: any,
    @Body() dtoPayload: UpdateUserDto,
  ) {
    const user = await this.userService.update(currentUser.id, dtoPayload);
    const userPermissions = await this.rbacService.getUserPermissions(currentUser.id);
    const permissions = userPermissions.map(p => `${p.resource}:${p.action}`);
    
    const roles = await this.rbacService.getUserRoles(currentUser.id);
    const roleString = roles.length > 0 ? (await this.rbacService.getRole(roles[0].roleId)).name : 'user';

    const dto = plainToInstance(UserResponseDto, user);
    dto.role = roleString;
    dto.permissions = permissions;

    return {
      success: true,
      data: dto,
    };
  }

  /**
   * Upload an avatar image for the current user.
   */
  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload avatar for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded' })
  async uploadAvatar(
    @CurrentUser() currentUser: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // In production this would upload to S3 and return the CDN URL.
    // For now we store a placeholder path.
    const avatarUrl = `/uploads/avatars/${currentUser.id}/${file.originalname}`;
    const user = await this.userService.updateAvatar(currentUser.id, avatarUrl);
    return {
      success: true,
      data: { avatarUrl: user.avatarUrl },
    };
  }

  /**
   * Get a user by their UUID (admin).
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    return {
      success: true,
      data: plainToInstance(UserResponseDto, user),
    };
  }

  /**
   * Update a user by their UUID (admin).
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user by ID (admin)' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    // Handle role reassignment if roleId is provided
    if (dto.roleId) {
      // Resolve role: if roleId is a name (e.g. 'org_admin'), look up the real UUID
      let resolvedRoleId = dto.roleId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.roleId);
      if (!isUuid) {
        const role = await this.rbacService.getRoleByName(dto.roleId);
        if (role) resolvedRoleId = role.id;
      }

      // Remove all existing roles for this user first
      const existingRoles = await this.rbacService.getUserRoles(id);
      for (const ur of existingRoles) {
        await this.rbacService.removeRoleFromUser(id, ur.roleId, ur.organizationId || undefined);
      }
      // Assign new role
      await this.rbacService.assignRoleToUser({ userId: id, roleId: resolvedRoleId });
    }

    // Remove roleId from dto before passing to user service (User entity doesn't have roleId)
    const { roleId, ...updateData } = dto;
    const user = await this.userService.update(id, updateData as any);
    return {
      success: true,
      data: plainToInstance(UserResponseDto, user),
    };
  }

  /**
   * Deactivate a user by their UUID (admin).
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate user (admin)' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.deactivate(id);
    return {
      success: true,
      message: 'User deactivated successfully',
    };
  }
}
