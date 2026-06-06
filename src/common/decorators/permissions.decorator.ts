import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to store required permissions on route handlers.
 * The {@link RbacGuard} reads this key at runtime.
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator that marks a route handler with required permissions.
 *
 * The RBAC guard will ensure the authenticated user possesses **all**
 * listed permissions before allowing access.
 *
 * @param permissions - One or more permission strings (e.g. `'content:read'`, `'content:write'`).
 *
 * @example
 *   @Post()
 *   @Permissions('content:create', 'content:publish')
 *   createContent() { ... }
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
