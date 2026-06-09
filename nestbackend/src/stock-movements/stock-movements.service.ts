import { BadRequestException, Injectable } from '@nestjs/common';
import { StockMovementType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateStockMovementDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const currentStock = await tx.inventoryStock.findUnique({
        where: {
          productId_branchId: {
            productId: dto.productId,
            branchId: dto.branchId,
          },
        },
      });

      const currentQuantity = currentStock?.quantity ?? 0;
      const nextQuantity = this.getNextQuantity(
        currentQuantity,
        dto.quantity,
        dto.type,
      );

      if (nextQuantity < 0) {
        throw new BadRequestException('Stock quantity cannot be negative');
      }

      await tx.inventoryStock.upsert({
        where: {
          productId_branchId: {
            productId: dto.productId,
            branchId: dto.branchId,
          },
        },
        update: { quantity: nextQuantity },
        create: {
          productId: dto.productId,
          branchId: dto.branchId,
          quantity: nextQuantity,
        },
      });

      return tx.stockMovement.create({
        data: { ...dto, userId },
        include: { product: true, branch: true, user: true },
      });
    });
  }

  findAll() {
    return this.prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: true, branch: true, user: true, salesOrder: true },
    });
  }

  findOne(id: string) {
    return this.prisma.stockMovement.findUniqueOrThrow({
      where: { id },
      include: { product: true, branch: true, user: true, salesOrder: true },
    });
  }

  update(id: string, dto: UpdateStockMovementDto) {
    return this.prisma.stockMovement.update({
      where: { id },
      data: dto,
      include: { product: true, branch: true, user: true, salesOrder: true },
    });
  }

  remove(id: string) {
    return this.prisma.stockMovement.delete({ where: { id } });
  }

  private getNextQuantity(
    currentQuantity: number,
    movementQuantity: number,
    movementType: StockMovementType,
  ) {
    if (
      movementType === StockMovementType.IN ||
      movementType === StockMovementType.RETURN
    ) {
      return currentQuantity + movementQuantity;
    }

    if (
      movementType === StockMovementType.OUT ||
      movementType === StockMovementType.SALE
    ) {
      return currentQuantity - movementQuantity;
    }

    return movementQuantity;
  }
}
