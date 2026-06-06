import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError, ApiErrorResponseDto } from '../dto/api-response.dto';
import { CORRELATION_ID_HEADER } from '../constants/app.constant';
import { INTERNAL_SERVER_ERROR } from '../constants/error-codes.constant';

/**
 * Catch-all exception filter for unhandled errors.
 *
 * Captures any exception that is **not** an {@link HttpException}
 * (or that slipped past the {@link HttpExceptionFilter}).
 *
 * - In **production** mode, returns a generic 500 message so that
 *   internal details are never leaked to clients.
 * - In **development** mode, includes the error message and stack
 *   trace for easier debugging.
 *
 * The full error stack is always logged regardless of environment.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Handles an unhandled exception and writes a standardised 500 response.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId =
      (request.headers[CORRELATION_ID_HEADER] as string) ?? undefined;

    // Determine status – if it somehow is an HttpException that reached here,
    // honour its status; otherwise default to 500.
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof Error ? exception.message : 'Unknown error';

    const errorStack =
      exception instanceof Error ? exception.stack : undefined;

    // Always log the full error for observability
    this.logger.error(
      `[${requestId ?? 'no-id'}] Unhandled exception on ${request.method} ${request.url}: ${errorMessage}`,
      errorStack,
    );

    const isProduction = process.env.NODE_ENV === 'production';

    const apiError = new ApiError(
      INTERNAL_SERVER_ERROR,
      isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : errorMessage,
    );

    const errorResponse = new ApiErrorResponseDto(apiError, requestId);

    response.status(status).json(errorResponse);
  }
}
