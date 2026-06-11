import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter';

function createHost(exceptionPath = '/api/products') {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));

  return {
    response: { status, json },
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({
          originalUrl: exceptionPath,
          url: exceptionPath,
        }),
      }),
    },
  };
}

describe('ApiExceptionFilter', () => {
  it('formats validation errors with a standard shape', () => {
    const filter = new ApiExceptionFilter();
    const { host, response } = createHost('/api/auth/login');
    const exception = new BadRequestException({
      message: ['email must be an email'],
      error: 'Bad Request',
      statusCode: 400,
    });

    filter.catch(exception, host as never);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        code: 'BAD_REQUEST',
        message: ['email must be an email'],
        path: '/api/auth/login',
        timestamp: expect.any(String),
      }),
    );
  });

  it('keeps forbidden responses explicit for RBAC clients', () => {
    const filter = new ApiExceptionFilter();
    const { host, response } = createHost('/api/users');

    filter.catch(new ForbiddenException(), host as never);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Forbidden',
        path: '/api/users',
      }),
    );
  });
});
