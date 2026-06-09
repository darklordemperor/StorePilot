import { Module } from '@nestjs/common';
import { SalesOrderItemsController } from './sales-order-items.controller';
import { SalesOrderItemsService } from './sales-order-items.service';

@Module({
  controllers: [SalesOrderItemsController],
  providers: [SalesOrderItemsService],
})
export class SalesOrderItemsModule {}
