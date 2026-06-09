import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  storeId: true,
  branchId: true,
  createdAt: true,
  updatedAt: true,
  store: true,
  branch: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role ?? Role.STAFF,
        storeId: dto.storeId,
        branchId: dto.branchId,
      },
      select: userSelect,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: userSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const { password, ...rest } = dto;
    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

    return this.prisma.user.update({
      where: { id },
      data: { ...rest, passwordHash },
      select: userSelect,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  }
}
