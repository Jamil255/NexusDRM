// ─── Pagination ──────────────────────────────────────────────────────────────

/** Default number of items per page when not specified. */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum number of items a client may request per page. */
export const MAX_PAGE_SIZE = 100;

// ─── File Upload ─────────────────────────────────────────────────────────────

/** Maximum allowed file size for content uploads (5 GB in bytes). */
export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

/** Maximum allowed file size for thumbnails / images (10 MB in bytes). */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Security ────────────────────────────────────────────────────────────────

/** Number of bcrypt hashing rounds for password hashing. */
export const BCRYPT_ROUNDS = 12;

/** Default access-token time-to-live. */
export const ACCESS_TOKEN_TTL = '15m';

/** Default refresh-token time-to-live. */
export const REFRESH_TOKEN_TTL = '7d';

/** Default API key prefix for identification. */
export const API_KEY_PREFIX = 'drms_';

/** Length of random tokens generated for verification, password reset, etc. */
export const RANDOM_TOKEN_LENGTH = 48;

// ─── Rate Limiting ───────────────────────────────────────────────────────────

/** Default sliding-window size in milliseconds (1 minute). */
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;

/** Default maximum number of requests per window. */
export const DEFAULT_RATE_LIMIT_MAX = 100;

// ─── Request Handling ────────────────────────────────────────────────────────

/** Default request timeout in milliseconds (30 seconds). */
export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/** Default cache TTL in seconds (60 seconds). */
export const DEFAULT_CACHE_TTL_SECONDS = 60;

// ─── Content Processing ─────────────────────────────────────────────────────

/** Maximum number of devices a single license may authorise by default. */
export const DEFAULT_DEVICE_LIMIT = 5;

/** AES-256 key length in bytes. */
export const AES_256_KEY_LENGTH = 32;

/** AES-GCM initialisation-vector length in bytes. */
export const AES_GCM_IV_LENGTH = 12;

/** AES-GCM authentication-tag length in bytes. */
export const AES_GCM_AUTH_TAG_LENGTH = 16;

// ─── Correlation / Headers ──────────────────────────────────────────────────

/** HTTP header name for request correlation / trace IDs. */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/** HTTP header name for API key authentication. */
export const API_KEY_HEADER = 'x-api-key';

/** HTTP header name for tenant / organisation identification. */
export const TENANT_ID_HEADER = 'x-tenant-id';
