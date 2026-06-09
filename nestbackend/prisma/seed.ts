import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  Role,
  SalesOrderStatus,
  StockMovementType,
} from '../src/generated/prisma/enums';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.refreshToken.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.inventoryStock.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: {
      name: 'StorePilot Retail Group',
      code: 'SPRG',
      description: 'Demo retail business for the StorePilot portfolio project.',
    },
  });

  const central = await prisma.branch.create({
    data: {
      name: 'Central Market',
      code: 'CTR',
      address: '12 Market Street, Bangkok',
      storeId: store.id,
    },
  });

  const riverside = await prisma.branch.create({
    data: {
      name: 'Riverside',
      code: 'RIV',
      address: '88 River Road, Bangkok',
      storeId: store.id,
    },
  });

  const [owner, manager, staff] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'owner@storepilot.local',
        passwordHash,
        name: 'Store Owner',
        role: Role.OWNER,
        storeId: store.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@storepilot.local',
        passwordHash,
        name: 'Maya Manager',
        role: Role.MANAGER,
        storeId: store.id,
        branchId: central.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff@storepilot.local',
        passwordHash,
        name: 'Sam Staff',
        role: Role.STAFF,
        storeId: store.id,
        branchId: riverside.id,
      },
    }),
  ]);

  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Coffee, tea, and ready-to-drink products.',
      storeId: store.id,
    },
  });

  const bakery = await prisma.category.create({
    data: {
      name: 'Bakery',
      description: 'Fresh bakery and pastry items.',
      storeId: store.id,
    },
  });

  const coldBrew = await prisma.product.create({
    data: {
      name: 'Cold Brew Coffee',
      sku: 'CB-001',
      description: 'House cold brew bottle.',
      price: 4.5,
      cost: 2.1,
      storeId: store.id,
      categoryId: beverages.id,
    },
  });

  const croissant = await prisma.product.create({
    data: {
      name: 'Croissant Butter',
      sku: 'CR-012',
      description: 'Classic butter croissant.',
      price: 3.25,
      cost: 1.4,
      storeId: store.id,
      categoryId: bakery.id,
    },
  });

  const jasmineTea = await prisma.product.create({
    data: {
      name: 'Jasmine Tea Tin',
      sku: 'TE-044',
      description: 'Loose-leaf jasmine tea.',
      price: 6.4,
      cost: 3.2,
      storeId: store.id,
      categoryId: beverages.id,
    },
  });

  await prisma.inventoryStock.createMany({
    data: [
      { productId: coldBrew.id, branchId: central.id, quantity: 54 },
      { productId: coldBrew.id, branchId: riverside.id, quantity: 36 },
      { productId: croissant.id, branchId: central.id, quantity: 22 },
      { productId: croissant.id, branchId: riverside.id, quantity: 18 },
      { productId: jasmineTea.id, branchId: central.id, quantity: 41 },
    ],
  });

  const lina = await prisma.customer.create({
    data: {
      name: 'Lina Wholesale',
      email: 'orders@lina.example',
      phone: '+66 80 222 1400',
      address: '18 Supply Lane, Bangkok',
      storeId: store.id,
    },
  });

  const riverCafe = await prisma.customer.create({
    data: {
      name: 'River Cafe',
      email: 'buyer@river.example',
      phone: '+66 81 555 9801',
      address: '44 Riverside Walk, Bangkok',
      storeId: store.id,
    },
  });

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber: 'SO-1001',
      status: SalesOrderStatus.COMPLETED,
      totalAmount: 33.75,
      storeId: store.id,
      branchId: central.id,
      customerId: lina.id,
      userId: manager.id,
      items: {
        create: [
          {
            productId: coldBrew.id,
            quantity: 5,
            unitPrice: 4.5,
            lineTotal: 22.5,
          },
          {
            productId: croissant.id,
            quantity: 3,
            unitPrice: 3.75,
            lineTotal: 11.25,
          },
        ],
      },
    },
  });

  await prisma.salesOrder.create({
    data: {
      orderNumber: 'SO-1002',
      status: SalesOrderStatus.DRAFT,
      totalAmount: 12.8,
      storeId: store.id,
      branchId: riverside.id,
      customerId: riverCafe.id,
      userId: staff.id,
      items: {
        create: [
          {
            productId: jasmineTea.id,
            quantity: 2,
            unitPrice: 6.4,
            lineTotal: 12.8,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        type: StockMovementType.SALE,
        quantity: 5,
        note: 'Seed sale SO-1001',
        productId: coldBrew.id,
        branchId: central.id,
        salesOrderId: order.id,
        userId: manager.id,
      },
      {
        type: StockMovementType.IN,
        quantity: 24,
        note: 'Opening stock replenishment',
        productId: croissant.id,
        branchId: riverside.id,
        userId: owner.id,
      },
    ],
  });

  console.log('Seed complete. Demo accounts use password: password123');
  console.log('owner@storepilot.local');
  console.log('manager@storepilot.local');
  console.log('staff@storepilot.local');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
