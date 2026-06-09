import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<{
      status: (statusCode: number) => {
        json: (body: Record<string, unknown>) => void;
      };
    }>();

    const mappedException = this.mapException(exception);
    const statusCode = mappedException.getStatus();

    response.status(statusCode).json({
      statusCode,
      error: mappedException.name.replace('Exception', ''),
      message: mappedException.message,
      timestamp: new Date().toISOString(),
    });
  }

  private mapException(exception: Prisma.PrismaClientKnownRequestError) {
    if (exception.code === 'P2002') {
      return new ConflictException(
        'A record with these details already exists',
      );
    }

    if (exception.code === 'P2025') {
      return new NotFoundException('Requested record was not found');
    }

    return new ConflictException('Database request failed');
  }
}
