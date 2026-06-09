import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Session } from '../user/entities/session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  comparePassword,
  hashPassword,
  hashToken,
  generateRandomToken,
} from '@common/utils/hash.util';
import { QueueService } from '@common/queue/queue.service';
import { QUEUE_EMAIL_NOTIFICATION } from '@common/queue/queue.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const verificationToken = generateRandomToken();
    const user = await this.userService.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    user.emailVerificationToken = verificationToken;
    await this.userRepository.save(user);

    // Queue email verification notification
    await this.queueService.publish(QUEUE_EMAIL_NOTIFICATION, {
      userId: user.id,
      type: 'VERIFY_EMAIL',
      token: verificationToken,
      email: user.email,
    });

    return user;
  }

  async login(
    dto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; user: User }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPwValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPwValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'PENDING_VERIFICATION') {
      throw new ForbiddenException({
        errorCode: 'AUTH_ACCOUNT_PENDING_VERIFICATION',
        message: 'Your account is pending email verification. Please verify your email.',
      });
    }
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException({
        errorCode: 'AUTH_ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended.',
      });
    }
    if (user.status === 'DEACTIVATED') {
      throw new ForbiddenException({
        errorCode: 'AUTH_ACCOUNT_DEACTIVATED',
        message: 'Your account is deactivated.',
      });
    }

    await this.validateConcurrentSessions(user.id, user.maxSessions);

    const tokens = await this.generateTokenPair(user);
    const hashedRefresh = hashToken(tokens.refreshToken);

    // Create session
    const session = this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash: hashedRefresh,
      deviceFingerprint: dto.deviceFingerprint || 'unknown',
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
    });
    await this.sessionRepository.save(session);

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    this.eventEmitter.emit('user.logged_in', {
      userId: user.id,
      email: user.email,
      ip: ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    const expiresInSeconds = 15 * 60; // 15 mins

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: expiresInSeconds,
      user,
    };
  }

  async refreshTokens(
    dto: RefreshTokenDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedToken = hashToken(dto.refreshToken);
    const session = await this.sessionRepository.findOne({
      where: { refreshTokenHash: hashedToken, isActive: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      session.isActive = false;
      await this.sessionRepository.save(session);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userService.findById(session.userId);
    if (!user || user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new UnauthorizedException('Access denied');
    }

    // Invalidate old token and rotate
    session.isActive = false;
    await this.sessionRepository.save(session);

    const tokens = await this.generateTokenPair(user);
    const newHashedRefresh = hashToken(tokens.refreshToken);

    const newSession = this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash: newHashedRefresh,
      deviceFingerprint: session.deviceFingerprint,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
    await this.sessionRepository.save(newSession);

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const hashedToken = hashToken(refreshToken);
    const session = await this.sessionRepository.findOne({
      where: { refreshTokenHash: hashedToken, isActive: true },
    });
    if (session) {
      session.isActive = false;
      await this.sessionRepository.save(session);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      // Don't leak user presence
      return;
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.userRepository.save(user);

    await this.queueService.publish(QUEUE_EMAIL_NOTIFICATION, {
      userId: user.id,
      type: 'PASSWORD_RESET',
      token: resetToken,
      email: user.email,
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const hashed = hashToken(dto.token);
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: hashed },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.passwordHash = await hashPassword(dto.newPassword);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    // Logout from all devices for security
    await this.logoutAll(user.id);

    this.eventEmitter.emit('password.reset', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.status = 'ACTIVE';
    await this.userRepository.save(user);
  }

  async getSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    session.isActive = false;
    await this.sessionRepository.save(session);
  }

  private async generateTokenPair(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email,
      organizationId: user.organizationId,
      type: 'access'
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = generateRandomToken(64);
    return { accessToken, refreshToken };
  }

  private async validateConcurrentSessions(userId: string, maxSessions: number): Promise<void> {
    const activeSessionsCount = await this.sessionRepository.count({
      where: { userId, isActive: true },
    });

    if (activeSessionsCount >= maxSessions) {
      // Invalidate the oldest active session
      const oldestSession = await this.sessionRepository.findOne({
        where: { userId, isActive: true },
        order: { createdAt: 'ASC' },
      });
      if (oldestSession) {
        oldestSession.isActive = false;
        await this.sessionRepository.save(oldestSession);
      }
    }
  }
}
