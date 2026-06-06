import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { RATE_LIMIT_EXCEEDED } from '../constants/error-codes.constant';
import {
  DEFAULT_RATE_LIMIT_MAX,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
} from '../constants/app.constant';
import { HttpStatus } from '@nestjs/common';

/**
 * Metadata key for rate-limit configuration on a route handler.
 */
export const RATE_LIMIT_KEY = 'rate_limit';

/**
 * Rate limit configuration interface.
 */
export interface RateLimitConfig {
  /** Sliding window size in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed within the window. */
  max: number;
}

/**
 * Decorator to configure rate limiting on a route handler.
 *
 * @param max      - Maximum number of requests within the window.
 * @param windowMs - Window size in milliseconds (default: 60 000).
 *
 * @example
 *   @RateLimit(10, 60_000) // 10 requests per minute
 *   @Post('login')
 *   login() { ... }
 */
export const RateLimit = (
  max: number = DEFAULT_RATE_LIMIT_MAX,
  windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS,
) => SetMetadata(RATE_LIMIT_KEY, { windowMs, max } as RateLimitConfig);

/**
 * Internal record of a single client's request timestamps.
 */
interface ClientRecord {
  timestamps: number[];
}

/**
 * Sliding-window rate-limit guard.
 *
 * Stores request counters in an in-memory `Map` keyed by client
 * identifier (user ID if authenticated, otherwise IP address).
 *
 * Configuration is read from the `@RateLimit()` decorator. If no
 * decorator is present, the default limits from app constants apply.
 *
 * **Note:** This implementation is per-process. In a multi-instance
 * deployment, replace with a Redis-backed implementation.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  /**
   * In-memory store: key = `routeKey:clientId`, value = request timestamps.
   */
  private readonly store = new Map<string, ClientRecord>();

  /** Interval handle for periodic cleanup of stale entries. */
  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly reflector: Reflector) {
    // Run cleanup every 60 seconds to prevent unbounded memory growth
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      60_000,
    );

    // Allow the process to exit without waiting for the interval
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Evaluates whether the current request is within the rate limit.
   *
   * @param context - Execution context.
   * @returns `true` if the request is allowed.
   * @throws {BusinessException} with `RATE_LIMIT_EXCEEDED` if the limit is hit.
   */
  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<RateLimitConfig | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const windowMs = config?.windowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
    const max = config?.max ?? DEFAULT_RATE_LIMIT_MAX;

    const request = context.switchToHttp().getRequest<Request>();
    const clientId = this.getClientId(request);
    const routeKey = `${request.method}:${request.route?.path ?? request.url}`;
    const storeKey = `${routeKey}:${clientId}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.store.get(storeKey);

    if (!record) {
      record = { timestamps: [] };
      this.store.set(storeKey, record);
    }

    // Remove timestamps outside the current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= max) {
      this.logger.warn(
        `Rate limit exceeded for client "${clientId}" on ${routeKey}. ` +
          `${record.timestamps.length}/${max} requests in ${windowMs}ms window.`,
      );

      throw new BusinessException(
        RATE_LIMIT_EXCEEDED,
        'Too many requests. Please slow down and try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.timestamps.push(now);
    return true;
  }

  /**
   * Extracts a unique client identifier from the request.
   * Prefers authenticated user ID, falls back to IP address.
   */
  private getClientId(request: Request): string {
    const user = request.user as { id?: string } | undefined;
    if (user?.id) {
      return `user:${user.id}`;
    }
    return `ip:${request.ip ?? request.socket.remoteAddress ?? 'unknown'}`;
  }

  /**
   * Periodically removes stale entries that are older than 2× the
   * default window to prevent unbounded memory growth.
   */
  private cleanup(): void {
    const cutoff = Date.now() - DEFAULT_RATE_LIMIT_WINDOW_MS * 2;
    let removed = 0;

    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Rate-limit cleanup: removed ${removed} stale entries.`);
    }
  }
}
