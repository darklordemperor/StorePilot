import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderItemRecordDto } from './dto/create-sales-order-item-record.dto';
import { UpdateSalesOrderItemDto } from './dto/update-sales-order-item.dto';

@Injectable()
export class SalesOrderItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSalesOrderItemRecordDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: dto.productId },
      });
      const unitPrice = dto.unitPrice ?? Number(product.price);
      const lineTotal = unitPrice * dto.quantity;

      const item = await tx.salesOrderItem.create({
        data: {
          salesOrderId: dto.salesOrderId,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPrice,
          lineTotal,
        },
        include: { product: true, salesOrder: true },
      });

      await tx.salesOrder.update({
        where: { id: dto.salesOrderId },
        data: { totalAmount: { increment: lineTotal } },
      });

      return item;
    });
  }

  findAll() {
    return this.prisma.salesOrderItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: true, salesOrder: true },
    });
  }

  findOne(id: string) {
    return this.prisma.salesOrderItem.findUniqueOrThrow({
      where: { id },
      include: { product: true, salesOrder: true },
    });
  }

  update(id: string, dto: UpdateSalesOrderItemDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.salesOrderItem.findUniqueOrThrow({
        where: { id },
      });
      const quantity = dto.quantity ?? existing.quantity;
      const unitPrice = dto.unitPrice ?? Number(existing.unitPrice);
      const lineTotal = quantity * unitPrice;
      const diff = lineTotal - Number(existing.lineTotal);

      if (lineTotal < 0) {
        throw new BadRequestException('Line total cannot be negative');
      }

      const item = await tx.salesOrderItem.update({
        where: { id },
        data: { quantity, unitPrice, lineTotal },
        include: { product: true, salesOrder: true },
      });

      await tx.salesOrder.update({
        where: { id: existing.salesOrderId },
        data: { totalAmount: { increment: diff } },
      });

      return item;
    });
  }

  remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.salesOrderItem.findUniqueOrThrow({
        where: { id },
      });
      const deleted = await tx.salesOrderItem.delete({
        where: { id },
        include: { product: true, salesOrder: true },
      });

      await tx.salesOrder.update({
        where: { id: existing.salesOrderId },
        data: { totalAmount: { decrement: existing.lineTotal } },
      });

      return deleted;
    });
  }
}
