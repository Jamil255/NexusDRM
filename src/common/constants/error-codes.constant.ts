// ─── Authentication Error Codes ──────────────────────────────────────────────

/** Supplied credentials (email/password) are invalid. */
export const AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS';

/** Access token has expired and must be refreshed. */
export const AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED';

/** Token is malformed, revoked, or otherwise invalid. */
export const AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID';

/** Refresh token has expired or been revoked. */
export const AUTH_REFRESH_TOKEN_EXPIRED = 'AUTH_REFRESH_TOKEN_EXPIRED';

/** User account has been suspended by an administrator. */
export const AUTH_ACCOUNT_SUSPENDED = 'AUTH_ACCOUNT_SUSPENDED';

/** User account is locked after too many failed login attempts. */
export const AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED';

/** User account has not completed email/identity verification. */
export const AUTH_ACCOUNT_PENDING_VERIFICATION = 'AUTH_ACCOUNT_PENDING_VERIFICATION';

/** User account has been permanently deactivated. */
export const AUTH_ACCOUNT_DEACTIVATED = 'AUTH_ACCOUNT_DEACTIVATED';

/** User does not have the required permissions for this action. */
export const AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS';

/** No authentication token was provided in the request. */
export const AUTH_NO_TOKEN = 'AUTH_NO_TOKEN';

// ─── Content Error Codes ─────────────────────────────────────────────────────

/** The requested content resource was not found. */
export const CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND';

/** A content item with the same identifier already exists. */
export const CONTENT_ALREADY_EXISTS = 'CONTENT_ALREADY_EXISTS';

/** The uploaded file exceeds the maximum allowed size. */
export const CONTENT_FILE_TOO_LARGE = 'CONTENT_FILE_TOO_LARGE';

/** The uploaded file type is not supported. */
export const CONTENT_UNSUPPORTED_FORMAT = 'CONTENT_UNSUPPORTED_FORMAT';

/** Content processing (transcoding, etc.) failed. */
export const CONTENT_PROCESSING_FAILED = 'CONTENT_PROCESSING_FAILED';

/** The content upload was interrupted or failed. */
export const CONTENT_UPLOAD_FAILED = 'CONTENT_UPLOAD_FAILED';

/** Integrity check (checksum) of the content failed. */
export const CONTENT_INTEGRITY_CHECK_FAILED = 'CONTENT_INTEGRITY_CHECK_FAILED';

/** Content is currently being processed and cannot be modified. */
export const CONTENT_LOCKED_FOR_PROCESSING = 'CONTENT_LOCKED_FOR_PROCESSING';

// ─── License Error Codes ─────────────────────────────────────────────────────

/** The requested license was not found. */
export const LICENSE_NOT_FOUND = 'LICENSE_NOT_FOUND';

/** The license has expired and is no longer valid. */
export const LICENSE_EXPIRED = 'LICENSE_EXPIRED';

/** The license has been revoked by the issuer. */
export const LICENSE_REVOKED = 'LICENSE_REVOKED';

/** The maximum number of devices for this license has been reached. */
export const LICENSE_DEVICE_LIMIT_EXCEEDED = 'LICENSE_DEVICE_LIMIT_EXCEEDED';

/** License creation or renewal failed. */
export const LICENSE_CREATION_FAILED = 'LICENSE_CREATION_FAILED';

/** The license type is invalid for the requested operation. */
export const LICENSE_INVALID_TYPE = 'LICENSE_INVALID_TYPE';

/** The user's subscription has lapsed and needs renewal. */
export const LICENSE_SUBSCRIPTION_LAPSED = 'LICENSE_SUBSCRIPTION_LAPSED';

// ─── DRM Error Codes ─────────────────────────────────────────────────────────

/** Content encryption process failed. */
export const DRM_ENCRYPTION_FAILED = 'DRM_ENCRYPTION_FAILED';

/** Content decryption process failed (bad key, tampered data, etc.). */
export const DRM_DECRYPTION_FAILED = 'DRM_DECRYPTION_FAILED';

/** Encryption key generation failed. */
export const DRM_KEY_GENERATION_FAILED = 'DRM_KEY_GENERATION_FAILED';

/** The requested encryption key was not found. */
export const DRM_KEY_NOT_FOUND = 'DRM_KEY_NOT_FOUND';

/** Key rotation process failed. */
export const DRM_KEY_ROTATION_FAILED = 'DRM_KEY_ROTATION_FAILED';

/** The signed URL is invalid or has been tampered with. */
export const DRM_SIGNED_URL_INVALID = 'DRM_SIGNED_URL_INVALID';

/** The signed URL has expired. */
export const DRM_SIGNED_URL_EXPIRED = 'DRM_SIGNED_URL_EXPIRED';

/** Digital watermarking process failed. */
export const DRM_WATERMARK_FAILED = 'DRM_WATERMARK_FAILED';

// ─── API Key Error Codes ─────────────────────────────────────────────────────

/** The provided API key is invalid or not recognized. */
export const API_KEY_INVALID = 'API_KEY_INVALID';

/** The API key has expired. */
export const API_KEY_EXPIRED = 'API_KEY_EXPIRED';

/** The API key does not have the required scope for this operation. */
export const API_KEY_INSUFFICIENT_SCOPE = 'API_KEY_INSUFFICIENT_SCOPE';

// ─── Rate Limiting Error Codes ───────────────────────────────────────────────

/** Too many requests; rate limit exceeded. */
export const RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED';

// ─── General Error Codes ─────────────────────────────────────────────────────

/** An unexpected internal server error occurred. */
export const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';

/** The requested resource was not found. */
export const RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';

/** Validation of the request payload failed. */
export const VALIDATION_FAILED = 'VALIDATION_FAILED';

/** The request conflicts with the current state of the resource. */
export const CONFLICT = 'CONFLICT';

/** The request timed out before a response could be generated. */
export const REQUEST_TIMEOUT = 'REQUEST_TIMEOUT';
