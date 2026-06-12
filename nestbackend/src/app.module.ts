import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SalesOrderItemsModule } from './sales-order-items/sales-order-items.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { StatisticsModule } from './statistics/statistics.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HealthModule,
    UsersModule,
    StoresModule,
    BranchesModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    StockMovementsModule,
    StatisticsModule,
    CustomersModule,
    SalesOrdersModule,
    SalesOrderItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
