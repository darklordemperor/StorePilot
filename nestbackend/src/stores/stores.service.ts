import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  create(createStoreDto: CreateStoreDto) {
    return this.prisma.store.create({ data: createStoreDto });
  }

  findAll() {
    return this.prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
      include: { branches: true },
    });
  }

  findOne(id: string) {
    return this.prisma.store.findUniqueOrThrow({
      where: { id },
      include: { branches: true, categories: true },
    });
  }

  update(id: string, updateStoreDto: UpdateStoreDto) {
    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    });
  }

  remove(id: string) {
    return this.prisma.store.delete({ where: { id } });
  }
}
