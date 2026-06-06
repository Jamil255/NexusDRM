import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to mark a route as accessible via API key authentication.
 */
export const API_KEY_ACCESSIBLE = 'api_key_accessible';

/**
 * Metadata key storing required scopes for API key authentication.
 */
export const API_KEY_SCOPES = 'api_key_scopes';

/**
 * Decorator that marks a route handler as accessible via API key.
 *
 * When applied, the {@link ApiKeyGuard} will accept requests authenticated
 * with a valid API key (via the `X-API-Key` header) in addition to
 * standard JWT authentication.
 *
 * @param scopes - Optional list of required scopes the API key must possess.
 *
 * @example
 *   @Get('feed')
 *   @ApiKeyAccessible('content:read')
 *   getContentFeed() { ... }
 *
 *   @Get('status')
 *   @ApiKeyAccessible() // no specific scopes required
 *   getStatus() { ... }
 */
export const ApiKeyAccessible = (...scopes: string[]) => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    SetMetadata(API_KEY_ACCESSIBLE, true)(target, propertyKey!, descriptor!);
    SetMetadata(API_KEY_SCOPES, scopes)(target, propertyKey!, descriptor!);
  };
};
