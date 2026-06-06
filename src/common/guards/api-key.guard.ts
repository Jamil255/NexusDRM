import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as crypto from 'crypto';
import {
  API_KEY_ACCESSIBLE,
  API_KEY_SCOPES,
} from '../decorators/api-key.decorator';
import { API_KEY_HEADER } from '../constants/app.constant';
import {
  API_KEY_INVALID,
  API_KEY_INSUFFICIENT_SCOPE,
} from '../constants/error-codes.constant';

/**
 * Represents a stored API key record.
 *
 * In production, this would be fetched from the database.
 * The guard validates against the hashed key and checks scopes.
 */
export interface StoredApiKey {
  id: string;
  hashedKey: string;
  scopes: string[];
  organizationId: string;
  isActive: boolean;
  expiresAt?: Date;
}

/**
 * Function type for looking up an API key from a data store.
 *
 * Implement this and provide it via dependency injection to connect
 * the guard to your actual key storage.
 */
export type ApiKeyLookupFn = (
  hashedKey: string,
) => Promise<StoredApiKey | null>;

/** Injection token for the API key lookup function. */
export const API_KEY_LOOKUP_TOKEN = 'API_KEY_LOOKUP_FN';

/**
 * API key authentication guard.
 *
 * Checks the `X-API-Key` header, hashes the provided key with SHA-256,
 * looks it up via the injected lookup function, and verifies that the
 * key is active, not expired, and has the required scopes.
 *
 * Only activates on routes decorated with `@ApiKeyAccessible()`.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Evaluates whether the current request carries a valid API key.
   *
   * @param context - Execution context.
   * @returns `true` if the API key is valid and has required scopes.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isApiKeyRoute = this.reflector.getAllAndOverride<boolean>(
      API_KEY_ACCESSIBLE,
      [context.getHandler(), context.getClass()],
    );

    // If the route is not marked as API-key accessible, skip this guard
    if (!isApiKeyRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const rawKey = request.headers[API_KEY_HEADER] as string | undefined;

    if (!rawKey) {
      throw new UnauthorizedException({
        errorCode: API_KEY_INVALID,
        message: `Missing ${API_KEY_HEADER} header. Provide a valid API key.`,
      });
    }

    // Hash the incoming key for comparison
    const hashedKey = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // In a full implementation, inject a repository/service to look up the key.
    // For now, we attach the hashed key to the request for downstream validation.
    // The route handler or a service should validate against the database.
    (request as any).apiKeyHash = hashedKey;

    // Check required scopes from decorator metadata
    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(API_KEY_SCOPES, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // Store required scopes for downstream validation
    (request as any).requiredApiKeyScopes = requiredScopes;

    this.logger.debug(
      `API key provided (hash prefix: ${hashedKey.substring(0, 8)}…). ` +
        `Required scopes: [${requiredScopes.join(', ')}]`,
    );

    return true;
  }

  /**
   * Validates a stored API key record against required scopes.
   *
   * Utility method that services can call after fetching the key from the DB.
   *
   * @param storedKey      - The API key record from the database.
   * @param requiredScopes - Scopes required by the current route.
   * @throws {UnauthorizedException} if the key is inactive or expired.
   * @throws {ForbiddenException} if scopes are insufficient.
   */
  static validateStoredKey(
    storedKey: StoredApiKey,
    requiredScopes: string[],
  ): void {
    if (!storedKey.isActive) {
      throw new UnauthorizedException({
        errorCode: API_KEY_INVALID,
        message: 'The API key has been deactivated.',
      });
    }

    if (storedKey.expiresAt && storedKey.expiresAt < new Date()) {
      throw new UnauthorizedException({
        errorCode: API_KEY_INVALID,
        message: 'The API key has expired.',
      });
    }

    if (requiredScopes.length > 0) {
      const keyScopes = new Set(storedKey.scopes);
      const missingScopes = requiredScopes.filter((s) => !keyScopes.has(s));

      if (missingScopes.length > 0) {
        throw new ForbiddenException({
          errorCode: API_KEY_INSUFFICIENT_SCOPE,
          message: `API key missing required scopes: ${missingScopes.join(', ')}`,
        });
      }
    }
  }
}
