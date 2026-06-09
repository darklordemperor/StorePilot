import { BadRequestException } from '@nestjs/common';
import { StockMovementType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { StockMovementsService } from './stock-movements.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('StockMovementsService', () => {
  const tx = {
    inventoryStock: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn((callback: (transaction: typeof tx) => unknown) =>
      callback(tx),
    ),
    stockMovement: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  let service: StockMovementsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StockMovementsService(prisma);
  });

  it('increments inventory for incoming stock', async () => {
    tx.inventoryStock.findUnique.mockResolvedValue({ quantity: 10 });
    tx.stockMovement.create.mockResolvedValue({ id: 'movement-1' });

    await service.create(
      {
        type: StockMovementType.IN,
        quantity: 5,
        productId: 'product-1',
        branchId: 'branch-1',
      },
      'user-1',
    );

    expect(tx.inventoryStock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { quantity: 15 },
      }),
    );
  });

  it('blocks movements that would create negative stock', async () => {
    tx.inventoryStock.findUnique.mockResolvedValue({ quantity: 3 });

    await expect(
      service.create(
        {
          type: StockMovementType.OUT,
          quantity: 5,
          productId: 'product-1',
          branchId: 'branch-1',
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.stockMovement.create).not.toHaveBeenCalled();
  });
});
