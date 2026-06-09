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
import { CreateInventoryStockDto } from './dto/create-inventory-stock.dto';
import { UpdateInventoryStockDto } from './dto/update-inventory-stock.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory-stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory-stock')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Body() dto: CreateInventoryStockDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryStockDto,
  ) {
    return this.inventoryService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.remove(id);
  }
}
