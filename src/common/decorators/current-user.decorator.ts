import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Authenticated user payload attached to the request by the JWT strategy.
 *
 * Services can define a richer interface; this is the minimal contract
 * that the decorator guarantees.
 */
export interface CurrentUserPayload {
  id: string;
  email: string;
  permissions?: string[];
  organizationId?: string;
  [key: string]: any;
}

/**
 * Custom parameter decorator that extracts the authenticated user
 * from the Express request object.
 *
 * The user object is expected to be set by Passport's JWT strategy on
 * `request.user`.
 *
 * @example
 *   @Get('me')
 *   getProfile(@CurrentUser() user: CurrentUserPayload) {
 *     return user;
 *   }
 *
 *   // Extract a single property:
 *   @Get('me/id')
 *   getId(@CurrentUser('id') userId: string) {
 *     return userId;
 *   }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as CurrentUserPayload | undefined;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
