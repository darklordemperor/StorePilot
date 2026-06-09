import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('AuthService', () => {
  type MockPrisma = {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  type MockJwtService = {
    signAsync: jest.Mock;
  };

  const user = {
    id: 'user-1',
    email: 'owner@storepilot.local',
    passwordHash:
      '$2a$12$Kw5V5q4k7tBvF4f1s6EzWeR2zRgrKcRGkN9AvZxse6V.CTaV87T7S',
    name: 'Store Owner',
    role: Role.OWNER,
    storeId: null,
    branchId: null,
    createdAt: new Date('2026-06-06T00:00:00.000Z'),
    updatedAt: new Date('2026-06-06T00:00:00.000Z'),
  };

  const prisma: MockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const jwtService: MockJwtService = {
    signAsync: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
    );
    jwtService.signAsync.mockResolvedValue('access-token');
    prisma.refreshToken.create.mockResolvedValue({ id: 'refresh-token-row' });
  });

  it('registers a user and returns public auth data', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);

    const result = await service.register({
      email: user.email,
      password: 'password123',
      name: user.name,
      role: Role.OWNER,
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.user).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
    expect(prisma.refreshToken.create.mock.calls.length).toBeGreaterThan(0);
  });

  it('rejects duplicate registration emails', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.register({
        email: user.email,
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: user.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
