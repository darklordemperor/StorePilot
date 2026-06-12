import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StatisticsPeriod = 'week' | 'month' | 'year';

type StatisticsQuery = {
  period?: StatisticsPeriod;
  month?: number;
  year?: number;
};

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: StatisticsQuery) {
    const latest = await this.prisma.businessStatistic.findFirst({
      orderBy: { date: 'desc' },
    });
    const latestDate = latest?.date ?? new Date(Date.UTC(2026, 5, 30));
    const period = query.period ?? 'week';
    const range = this.getRange(period, latestDate, query.month, query.year);
    const rows = await this.prisma.businessStatistic.findMany({
      where: {
        date: {
          gte: range.start,
          lte: range.end,
        },
      },
      orderBy: { date: 'asc' },
    });

    const series = rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      revenue: Number(row.revenue),
      orderCount: row.orderCount,
      unitsSold: row.unitsSold,
      productBuyCount: row.productBuyCount,
      productReturnCount: row.productReturnCount,
      customerCount: row.customerCount,
    }));
    const totals = series.reduce(
      (total, row) => ({
        revenue: total.revenue + row.revenue,
        orderCount: total.orderCount + row.orderCount,
        unitsSold: total.unitsSold + row.unitsSold,
        productBuyCount: total.productBuyCount + row.productBuyCount,
        productReturnCount: total.productReturnCount + row.productReturnCount,
        customerCount: total.customerCount + row.customerCount,
      }),
      {
        revenue: 0,
        orderCount: 0,
        unitsSold: 0,
        productBuyCount: 0,
        productReturnCount: 0,
        customerCount: 0,
      },
    );

    return {
      period,
      month: range.month,
      year: range.year,
      startDate: range.start.toISOString().slice(0, 10),
      endDate: range.end.toISOString().slice(0, 10),
      totals: {
        ...totals,
        revenue: Number(totals.revenue.toFixed(2)),
      },
      mix: [
        { label: 'Orders', value: totals.orderCount },
        { label: 'Product buys', value: totals.productBuyCount },
        { label: 'Returns', value: totals.productReturnCount },
      ],
      series,
    };
  }

  private getRange(
    period: StatisticsPeriod,
    latestDate: Date,
    requestedMonth?: number,
    requestedYear?: number,
  ) {
    const year = requestedYear ?? latestDate.getUTCFullYear();
    const month = requestedMonth ?? latestDate.getUTCMonth() + 1;

    if (period === 'year') {
      return {
        start: new Date(Date.UTC(year, 0, 1)),
        end: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
        month,
        year,
      };
    }

    if (period === 'month') {
      return {
        start: new Date(Date.UTC(year, month - 1, 1)),
        end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
        month,
        year,
      };
    }

    const end = new Date(
      Date.UTC(
        latestDate.getUTCFullYear(),
        latestDate.getUTCMonth(),
        latestDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);
    start.setUTCHours(0, 0, 0, 0);

    return {
      start,
      end,
      month: end.getUTCMonth() + 1,
      year: end.getUTCFullYear(),
    };
  }
}
