import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AUTH_INSUFFICIENT_PERMISSIONS } from '../constants/error-codes.constant';

/**
 * Role-Based Access Control (RBAC) guard.
 *
 * Reads the required permissions set via `@Permissions()` decorator
 * on the route handler, then verifies that the authenticated user
 * (attached to `request.user` by the JWT strategy) possesses **all**
 * of the required permissions.
 *
 * If no permissions are specified on the route, access is granted.
 */
@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Evaluates whether the current request satisfies permission requirements.
   *
   * @param context - Execution context containing the request and handler metadata.
   * @returns `true` if the user has all required permissions.
   * @throws {ForbiddenException} if permissions are insufficient.
   */
  canActivate(context: ExecutionContext): boolean {
    // Merge handler-level and class-level permissions
    const requiredPermissions = this.reflector.getAllAndMerge<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions specified → allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as
      | { permissions?: string[]; id?: string }
      | undefined;

    if (!user) {
      this.logger.warn('RBAC check failed: no user on request');
      throw new ForbiddenException({
        errorCode: AUTH_INSUFFICIENT_PERMISSIONS,
        message: 'Access denied. Authentication is required.',
      });
    }

    const userPermissions = new Set(user.permissions ?? []);

    const hasAll = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasAll) {
      const missing = requiredPermissions.filter(
        (perm) => !userPermissions.has(perm),
      );
      this.logger.warn(
        `RBAC check failed for user "${user.id}". Missing: [${missing.join(', ')}]`,
      );
      throw new ForbiddenException({
        errorCode: AUTH_INSUFFICIENT_PERMISSIONS,
        message: `Access denied. Missing permissions: ${missing.join(', ')}`,
      });
    }

    return true;
  }
}
