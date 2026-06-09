import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '@modules/user/user.service';
import { RbacService } from '@modules/rbac/rbac.service';

/**
 * JWT access-token payload shape.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  organizationId?: string;
  type: 'access';
}

/**
 * Passport strategy that validates a Bearer JWT access token.
 * Extracts the token from the Authorization header and verifies
 * it against the configured access-token secret.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly rbacService: RbacService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'default-secret'),
    });
  }

  /**
   * Called after the JWT is verified. Loads the full user record and
   * attaches it to the request object.
   *
   * @param payload - Decoded JWT payload
   * @returns The user record to attach to `req.user`
   * @throws UnauthorizedException if the user cannot be found or is inactive
   */
  async validate(payload: JwtPayload): Promise<any> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: 'AUTH_TOKEN_INVALID',
        message: 'Authentication failed. User not found.',
      });
    }

    if (user.status !== 'ACTIVE') {
      if (user.status === 'PENDING_VERIFICATION') {
        throw new UnauthorizedException({
          errorCode: 'AUTH_ACCOUNT_PENDING_VERIFICATION',
          message: 'Your account is pending email verification. Please verify your email.',
        });
      }
      throw new UnauthorizedException({
        errorCode: 'AUTH_ACCOUNT_INACTIVE',
        message: `Your account is currently ${user.status.toLowerCase()}.`,
      });
    }

    // Load user permissions and attach them to the request context
    const permissions = await this.rbacService.getUserPermissions(user.id);
    const permissionStrings = permissions.map(p => `${p.resource}:${p.action}`);

    return {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      status: user.status,
      permissions: permissionStrings,
    };
  }
}
