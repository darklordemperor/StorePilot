import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorResponseBody = {
  error?: string;
  message?: string | string[];
  code?: string;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const mappedException = this.mapException(exception);
    const statusCode = mappedException.getStatus();
    const body = mappedException.getResponse();
    const responseBody =
      typeof body === 'object' && body !== null
        ? (body as ErrorResponseBody)
        : ({ message: body } as ErrorResponseBody);

    response.status(statusCode).json({
      statusCode,
      code: responseBody.code ?? this.toCode(responseBody.error, statusCode),
      message:
        responseBody.message ??
        responseBody.error ??
        mappedException.message ??
        'Request failed',
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapException(exception: unknown): HttpException {
    if (exception instanceof HttpException) {
      return exception;
    }

    if (this.isPrismaKnownRequestError(exception)) {
      if (exception.code === 'P2002') {
        return new ConflictException({
          code: 'CONFLICT',
          message: 'A record with these details already exists',
        });
      }

      if (exception.code === 'P2025') {
        return new NotFoundException({
          code: 'NOT_FOUND',
          message: 'Requested record was not found',
        });
      }

      return new ConflictException({
        code: 'DATABASE_REQUEST_FAILED',
        message: 'Database request failed',
      });
    }

    return new InternalServerErrorException({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  }

  private isPrismaKnownRequestError(
    exception: unknown,
  ): exception is { code: string } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as { code?: unknown }).code === 'string' &&
      (exception as { clientVersion?: unknown }).clientVersion !== undefined
    );
  }

  private toCode(error: string | undefined, statusCode: number) {
    if (error) {
      return error
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase();
    }

    return (HttpStatus as Record<number, string>)[statusCode] ?? 'REQUEST_FAILED';
  }
}
