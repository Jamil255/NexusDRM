import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Application-level business exception.
 *
 * Extends NestJS {@link HttpException} with a machine-readable error code
 * and optional structured details array. The global exception filter
 * translates this into a standardized {@link ApiErrorResponseDto}.
 *
 * @example
 *   throw new BusinessException(
 *     'CONTENT_NOT_FOUND',
 *     'The requested content does not exist.',
 *     HttpStatus.NOT_FOUND,
 *   );
 */
export class BusinessException extends HttpException {
  /** Machine-readable error code (e.g. `AUTH_INVALID_CREDENTIALS`). */
  public readonly errorCode: string;

  /** Optional array of detailed error information. */
  public readonly details?: Array<{ field?: string; message: string }>;

  /**
   * @param errorCode  - Machine-readable error code constant.
   * @param message    - Human-readable error message.
   * @param statusCode - HTTP status code to return. Defaults to 400 Bad Request.
   * @param details    - Optional detailed error array (validation errors, etc.).
   */
  constructor(
    errorCode: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Array<{ field?: string; message: string }>,
  ) {
    super(
      {
        errorCode,
        message,
        details,
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.details = details;
  }
}
