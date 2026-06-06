import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { LICENSE_DEVICE_LIMIT_EXCEEDED } from '../constants/error-codes.constant';
import { DEFAULT_DEVICE_LIMIT } from '../constants/app.constant';

/**
 * Shape of the authenticated user payload that includes device/license info.
 *
 * The JWT strategy (or a preceding guard) should populate these fields.
 */
interface UserWithDeviceInfo {
  id: string;
  /** Number of devices currently registered for this user's license. */
  activeDeviceCount?: number;
  /** Maximum devices allowed by the user's license. */
  deviceLimit?: number;
}

/**
 * Device-limit guard.
 *
 * Checks whether the current user's active device count has reached
 * the maximum allowed by their license. The device information is
 * expected on the `request.user` object (populated by authentication
 * middleware or a preceding guard).
 *
 * If the user object does not contain device information, the guard
 * passes (allowing other layers to handle device tracking).
 *
 * Attach via `@UseGuards(DeviceLimitGuard)` on routes that serve
 * DRM-protected content.
 */
@Injectable()
export class DeviceLimitGuard implements CanActivate {
  private readonly logger = new Logger(DeviceLimitGuard.name);

  /**
   * Evaluates whether the requesting device is within the license limit.
   *
   * @param context - Execution context.
   * @returns `true` if the device is allowed.
   * @throws {ForbiddenException} if the device limit is exceeded.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserWithDeviceInfo | undefined;

    // If there's no user or no device info, let the request through.
    // Device tracking is handled at the service layer; this guard is
    // an early fast-fail check.
    if (!user) {
      return true;
    }

    const activeDeviceCount = user.activeDeviceCount;
    const deviceLimit = user.deviceLimit ?? DEFAULT_DEVICE_LIMIT;

    // No device count info available – skip check
    if (activeDeviceCount === undefined || activeDeviceCount === null) {
      return true;
    }

    if (activeDeviceCount >= deviceLimit) {
      this.logger.warn(
        `Device limit exceeded for user "${user.id}": ` +
          `${activeDeviceCount}/${deviceLimit} devices active.`,
      );

      throw new ForbiddenException({
        errorCode: LICENSE_DEVICE_LIMIT_EXCEEDED,
        message:
          `Device limit of ${deviceLimit} has been reached. ` +
          `Please deregister an existing device before accessing content on a new device.`,
      });
    }

    return true;
  }
}
