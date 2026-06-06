import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Refresh-token JWT payload shape.
 */
export interface RefreshTokenPayload {
  sub: string;
  email: string;
  sessionId: string;
  type: 'refresh';
}

/**
 * Passport strategy specifically for validating refresh tokens.
 * Uses a separate secret from the access-token strategy so the two
 * token types are not interchangeable.
 */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
    });
  }

  /**
   * Validates the decoded refresh token payload.
   *
   * @param payload - Decoded refresh token payload
   * @returns The payload to attach to the request
   * @throws UnauthorizedException if the token type is not 'refresh'
   */
  async validate(payload: RefreshTokenPayload): Promise<RefreshTokenPayload> {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    return payload;
  }
}
