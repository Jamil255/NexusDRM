import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiError,
  ApiErrorDetail,
  ApiErrorResponseDto,
} from '../dto/api-response.dto';
import { BusinessException } from '../exceptions/business.exception';
import { CORRELATION_ID_HEADER } from '../constants/app.constant';
import * as ErrorCodes from '../constants/error-codes.constant';

/**
 * Global exception filter for all {@link HttpException} instances.
 *
 * Catches both standard NestJS HTTP exceptions and custom
 * {@link BusinessException} subclasses, translating them into
 * a standardized {@link ApiErrorResponseDto} response envelope.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Handles an HTTP exception and writes a standardised JSON error response.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const requestId =
      (request.headers[CORRELATION_ID_HEADER] as string) ?? undefined;

    let errorCode: string;
    let message: string;
    let details: ApiErrorDetail[] | undefined;

    if (exception instanceof BusinessException) {
      errorCode = exception.errorCode;
      message = exception.message;
      details = exception.details?.map(
        (d) => new ApiErrorDetail(d.message, d.field),
      );
    } else {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorCode = this.statusToErrorCode(status);
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, any>;
        errorCode = res.errorCode ?? this.statusToErrorCode(status);
        message = res.message ?? exception.message;

        // Handle class-validator validation errors
        if (Array.isArray(res.message)) {
          errorCode = ErrorCodes.VALIDATION_FAILED;
          message = 'Validation failed';
          details = (res.message as string[]).map(
            (msg) => new ApiErrorDetail(msg),
          );
        }
      } else {
        errorCode = this.statusToErrorCode(status);
        message = exception.message;
      }
    }

    const apiError = new ApiError(errorCode, message, details);
    const errorResponse = new ApiErrorResponseDto(apiError, requestId);

    this.logger.warn(
      `[${requestId ?? 'no-id'}] ${request.method} ${request.url} → ${status} ${errorCode}: ${message}`,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Maps an HTTP status code to a generic error code string.
   */
  private statusToErrorCode(status: number): string {
    switch (status) {
      case 400:
        return ErrorCodes.VALIDATION_FAILED;
      case 401:
        return ErrorCodes.AUTH_TOKEN_INVALID;
      case 403:
        return ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS;
      case 404:
        return ErrorCodes.RESOURCE_NOT_FOUND;
      case 409:
        return ErrorCodes.CONFLICT;
      case 408:
        return ErrorCodes.REQUEST_TIMEOUT;
      case 429:
        return ErrorCodes.RATE_LIMIT_EXCEEDED;
      default:
        return ErrorCodes.INTERNAL_SERVER_ERROR;
    }
  }
}
