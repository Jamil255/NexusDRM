/**
 * Standard API success response wrapper.
 *
 * All successful responses from the DRMS API are wrapped in this format
 * to provide a predictable structure for clients.
 *
 * @typeParam T - The type of the `data` payload.
 */
export class ApiResponseDto<T> {
  /** Indicates the request was successful. Always `true`. */
  success: true;

  /** Response payload. */
  data: T;

  /** Optional metadata (pagination info, version, etc.). */
  meta?: Record<string, any>;

  /** ISO-8601 timestamp of when the response was generated. */
  timestamp: string;

  /** Correlation / request ID for tracing. */
  requestId?: string;

  constructor(data: T, meta?: Record<string, any>, requestId?: string) {
    this.success = true;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

/**
 * Describes a single validation / field-level error.
 */
export class ApiErrorDetail {
  /** The field or parameter that caused the error. */
  field?: string;

  /** Human-readable description of the problem. */
  message: string;

  constructor(message: string, field?: string) {
    this.message = message;
    this.field = field;
  }
}

/**
 * Structured error information returned within {@link ApiErrorResponseDto}.
 */
export class ApiError {
  /** Machine-readable error code (e.g. `AUTH_INVALID_CREDENTIALS`). */
  code: string;

  /** Human-readable error message. */
  message: string;

  /** Optional array of detailed validation / field errors. */
  details?: ApiErrorDetail[];

  constructor(code: string, message: string, details?: ApiErrorDetail[]) {
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

/**
 * Standard API error response wrapper.
 *
 * All error responses from the DRMS API are wrapped in this format.
 */
export class ApiErrorResponseDto {
  /** Always `false` for error responses. */
  success: false;

  /** Structured error information. */
  error: ApiError;

  /** ISO-8601 timestamp of when the error occurred. */
  timestamp: string;

  /** Correlation / request ID for tracing. */
  requestId?: string;

  constructor(error: ApiError, requestId?: string) {
    this.success = false;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}
