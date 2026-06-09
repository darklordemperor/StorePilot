import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryStockDto } from './dto/create-inventory-stock.dto';
import { UpdateInventoryStockDto } from './dto/update-inventory-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateInventoryStockDto) {
    return this.prisma.inventoryStock.create({ data: dto });
  }

  findAll() {
    return this.prisma.inventoryStock.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { product: true, branch: true },
    });
  }

  findOne(id: string) {
    return this.prisma.inventoryStock.findUniqueOrThrow({
      where: { id },
      include: { product: true, branch: true },
    });
  }

  update(id: string, dto: UpdateInventoryStockDto) {
    return this.prisma.inventoryStock.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.inventoryStock.delete({ where: { id } });
  }
}
