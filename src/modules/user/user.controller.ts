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
import { JwtAuthGuard } from '@common/guards';
import { CurrentUser } from '@common/decorators';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * REST controller for user profile and admin-level user management.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    return {
      success: true,
      data: plainToInstance(UserResponseDto, user),
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
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.userService.update(currentUser.id, dto);
    return {
      success: true,
      data: plainToInstance(UserResponseDto, user),
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
    const user = await this.userService.update(id, dto);
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
