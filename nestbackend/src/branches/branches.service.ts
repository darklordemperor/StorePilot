import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({ data: dto });
  }

  findAll() {
    return this.prisma.branch.findMany({
      orderBy: { createdAt: 'desc' },
      include: { store: true },
    });
  }

  findOne(id: string) {
    return this.prisma.branch.findUniqueOrThrow({
      where: { id },
      include: { store: true, inventoryStock: { include: { product: true } } },
    });
  }

  update(id: string, dto: UpdateBranchDto) {
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }
}
