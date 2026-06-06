import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  AUTH_NO_TOKEN,
  AUTH_TOKEN_EXPIRED,
  AUTH_TOKEN_INVALID,
} from '../constants/error-codes.constant';

/**
 * JWT authentication guard.
 *
 * Extends Passport's built-in `AuthGuard('jwt')` to provide
 * custom error messages that align with the DRMS error-code system.
 *
 * Attach to controllers or individual routes via `@UseGuards(JwtAuthGuard)`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override to customise error handling when authentication fails.
   *
   * @param err  - Error thrown by the Passport strategy (if any).
   * @param user - Authenticated user payload, or `false` / `undefined` on failure.
   * @param info - Additional info from the strategy (e.g. `TokenExpiredError`).
   * @returns The authenticated user payload.
   * @throws {UnauthorizedException} with a DRM error code.
   */
  handleRequest<T = any>(err: any, user: T, info: any): T {
    if (err) {
      throw new UnauthorizedException({
        errorCode: AUTH_TOKEN_INVALID,
        message: 'Authentication failed. The provided token is invalid.',
      });
    }

    if (!user) {
      // Determine the reason from the info object set by passport-jwt
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          errorCode: AUTH_TOKEN_EXPIRED,
          message:
            'Authentication token has expired. Please refresh your token.',
        });
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          errorCode: AUTH_TOKEN_INVALID,
          message: 'Authentication token is malformed or invalid.',
        });
      }

      if (info?.message === 'No auth token') {
        throw new UnauthorizedException({
          errorCode: AUTH_NO_TOKEN,
          message:
            'No authentication token provided. Please include a valid Bearer token.',
        });
      }

      throw new UnauthorizedException({
        errorCode: AUTH_TOKEN_INVALID,
        message:
          'Authentication failed. Please provide a valid Bearer token.',
      });
    }

    return user;
  }
}
