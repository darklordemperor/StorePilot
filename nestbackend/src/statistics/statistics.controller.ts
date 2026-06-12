import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatisticsService } from './statistics.service';
import type { StatisticsPeriod } from './statistics.service';

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  findAll(
    @Query('period') period?: StatisticsPeriod,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.statisticsService.findAll({
      period,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });
  }
}
