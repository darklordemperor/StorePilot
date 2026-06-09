import { BadRequestException, Injectable } from '@nestjs/common';
import { SalesOrderStatus, StockMovementType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

@Injectable()
export class SalesOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSalesOrderDto, userId: string) {
    if (!dto.items.length) {
      throw new BadRequestException('Sales order requires at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: dto.items.map((item) => item.productId) } },
      });

      const productById = new Map(
        products.map((product) => [product.id, product]),
      );

      if (products.length !== dto.items.length) {
        throw new BadRequestException('One or more products were not found');
      }

      const items = dto.items.map((item) => {
        const product = productById.get(item.productId);
        const unitPrice = item.unitPrice ?? Number(product?.price ?? 0);
        const lineTotal = unitPrice * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        };
      });

      const totalAmount = items.reduce(
        (total, item) => total + item.lineTotal,
        0,
      );
      const status = dto.status ?? SalesOrderStatus.COMPLETED;

      const salesOrder = await tx.salesOrder.create({
        data: {
          orderNumber: dto.orderNumber,
          status,
          totalAmount,
          storeId: dto.storeId,
          branchId: dto.branchId,
          customerId: dto.customerId,
          userId,
          items: { create: items },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
          branch: true,
          user: true,
        },
      });

      if (status === SalesOrderStatus.COMPLETED) {
        for (const item of items) {
          const stock = await tx.inventoryStock.findUnique({
            where: {
              productId_branchId: {
                productId: item.productId,
                branchId: dto.branchId,
              },
            },
          });

          const nextQuantity = (stock?.quantity ?? 0) - item.quantity;

          if (nextQuantity < 0) {
            throw new BadRequestException('Stock quantity cannot be negative');
          }

          await tx.inventoryStock.upsert({
            where: {
              productId_branchId: {
                productId: item.productId,
                branchId: dto.branchId,
              },
            },
            update: { quantity: nextQuantity },
            create: {
              productId: item.productId,
              branchId: dto.branchId,
              quantity: nextQuantity,
            },
          });

          await tx.stockMovement.create({
            data: {
              type: StockMovementType.SALE,
              quantity: item.quantity,
              productId: item.productId,
              branchId: dto.branchId,
              salesOrderId: salesOrder.id,
              userId,
              note: `Sales order ${dto.orderNumber}`,
            },
          });
        }
      }

      return salesOrder;
    });
  }

  findAll() {
    return this.prisma.salesOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        customer: true,
        branch: true,
        user: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.salesOrder.findUniqueOrThrow({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
        branch: true,
        user: true,
        stockMovements: true,
      },
    });
  }

  update(id: string, dto: UpdateSalesOrderDto) {
    return this.prisma.salesOrder.update({
      where: { id },
      data: dto,
      include: { items: true, customer: true, branch: true },
    });
  }

  remove(id: string) {
    return this.prisma.salesOrder.delete({ where: { id } });
  }
}
