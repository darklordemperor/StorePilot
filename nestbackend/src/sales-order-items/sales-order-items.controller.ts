import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../generated/prisma/enums';
import { CreateSalesOrderItemRecordDto } from './dto/create-sales-order-item-record.dto';
import { UpdateSalesOrderItemDto } from './dto/update-sales-order-item.dto';
import { SalesOrderItemsService } from './sales-order-items.service';

@ApiTags('sales-order-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales-order-items')
export class SalesOrderItemsController {
  constructor(
    private readonly salesOrderItemsService: SalesOrderItemsService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Body() dto: CreateSalesOrderItemRecordDto) {
    return this.salesOrderItemsService.create(dto);
  }

  @Get()
  findAll() {
    return this.salesOrderItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesOrderItemsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalesOrderItemDto,
  ) {
    return this.salesOrderItemsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesOrderItemsService.remove(id);
  }
}
