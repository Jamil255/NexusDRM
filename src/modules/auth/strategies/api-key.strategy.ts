import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { IncomingMessage } from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { hashToken } from '@common/utils';

/**
 * Custom Passport strategy that authenticates requests using an
 * API key supplied in the `X-API-Key` header.
 *
 * The key is hashed and compared against stored hashes in the database
 * to avoid storing raw API keys.
 */
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  /**
   * Core authentication method called by Passport.
   */
  async authenticate(req: IncomingMessage & { headers: Record<string, string | string[] | undefined> }): Promise<void> {
    const apiKey = req.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      return this.fail(new UnauthorizedException('API key is required'), 401);
    }

    try {
      const hashedKey = hashToken(apiKey);

      // Look up the user whose stored API-key hash matches.
      // In a real system this would query an `api_keys` table;
      // here we demonstrate the pattern against the user table.
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.status = :status', { status: 'ACTIVE' })
        .andWhere('user.email_verification_token = :hash', { hash: hashedKey })
        .getOne();

      if (!user) {
        return this.fail(new UnauthorizedException('Invalid API key'), 401);
      }

      return this.success({
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        status: user.status,
      });
    } catch (error) {
      return this.error(error);
    }
  }
}
