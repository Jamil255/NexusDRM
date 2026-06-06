import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';
import * as ErrorCodes from '../constants/error-codes.constant';

/**
 * Base class for all DRM-specific exceptions.
 *
 * Provides a semantic layer over {@link BusinessException} for errors
 * directly related to digital rights management operations.
 */
export class DrmException extends BusinessException {
  constructor(
    errorCode: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.FORBIDDEN,
    details?: Array<{ field?: string; message: string }>,
  ) {
    super(errorCode, message, statusCode, details);
  }
}

/**
 * Thrown when a user attempts to access content with an expired license.
 */
export class LicenseExpiredException extends DrmException {
  constructor(licenseId?: string) {
    super(
      ErrorCodes.LICENSE_EXPIRED,
      licenseId
        ? `License "${licenseId}" has expired. Please renew to continue access.`
        : 'Your license has expired. Please renew to continue access.',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when a license has been explicitly revoked.
 */
export class LicenseRevokedException extends DrmException {
  constructor(licenseId?: string) {
    super(
      ErrorCodes.LICENSE_REVOKED,
      licenseId
        ? `License "${licenseId}" has been revoked.`
        : 'Your license has been revoked.',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when the user attempts to register more devices than their
 * license allows.
 */
export class DeviceLimitExceededException extends DrmException {
  constructor(maxDevices?: number) {
    super(
      ErrorCodes.LICENSE_DEVICE_LIMIT_EXCEEDED,
      maxDevices
        ? `Device limit of ${maxDevices} has been reached. Please deregister an existing device.`
        : 'Maximum device limit has been reached. Please deregister an existing device.',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when content encryption fails.
 */
export class ContentEncryptionException extends DrmException {
  constructor(contentId?: string, reason?: string) {
    super(
      ErrorCodes.DRM_ENCRYPTION_FAILED,
      contentId
        ? `Encryption failed for content "${contentId}".${reason ? ` Reason: ${reason}` : ''}`
        : `Content encryption failed.${reason ? ` Reason: ${reason}` : ''}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Thrown when content decryption fails (bad key, tampered data, etc.).
 */
export class ContentDecryptionException extends DrmException {
  constructor(reason?: string) {
    super(
      ErrorCodes.DRM_DECRYPTION_FAILED,
      `Content decryption failed.${reason ? ` Reason: ${reason}` : ''}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Thrown when encryption key generation fails.
 */
export class KeyGenerationException extends DrmException {
  constructor(reason?: string) {
    super(
      ErrorCodes.DRM_KEY_GENERATION_FAILED,
      `Encryption key generation failed.${reason ? ` Reason: ${reason}` : ''}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Thrown when a required encryption key cannot be found.
 */
export class KeyNotFoundException extends DrmException {
  constructor(keyId?: string) {
    super(
      ErrorCodes.DRM_KEY_NOT_FOUND,
      keyId
        ? `Encryption key "${keyId}" was not found.`
        : 'Required encryption key was not found.',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Thrown when key rotation fails.
 */
export class KeyRotationException extends DrmException {
  constructor(reason?: string) {
    super(
      ErrorCodes.DRM_KEY_ROTATION_FAILED,
      `Key rotation failed.${reason ? ` Reason: ${reason}` : ''}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Thrown when a signed URL is invalid or has been tampered with.
 */
export class SignedUrlInvalidException extends DrmException {
  constructor() {
    super(
      ErrorCodes.DRM_SIGNED_URL_INVALID,
      'The signed URL is invalid or has been tampered with.',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when a signed URL has expired.
 */
export class SignedUrlExpiredException extends DrmException {
  constructor() {
    super(
      ErrorCodes.DRM_SIGNED_URL_EXPIRED,
      'The signed URL has expired. Please request a new one.',
      HttpStatus.GONE,
    );
  }
}

/**
 * Thrown when digital watermarking fails.
 */
export class WatermarkException extends DrmException {
  constructor(reason?: string) {
    super(
      ErrorCodes.DRM_WATERMARK_FAILED,
      `Watermarking failed.${reason ? ` Reason: ${reason}` : ''}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
