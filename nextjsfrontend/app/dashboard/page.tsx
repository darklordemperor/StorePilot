"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  ChartPie,
  PackageCheck,
  Plus,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, PageAction, Section } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type {
  Branch,
  InventoryStock,
  Product,
  SalesOrder,
  StatisticsPeriod,
  StatisticsResponse,
  Store,
} from "@/lib/api";
import {
  activeBranchCount,
  formatCurrency,
  formatDateTime,
  productStock,
  totalSales,
} from "@/lib/dashboard-data";
import { useApiResource } from "@/lib/use-api-resource";

type DashboardPayload = {
  products: Product[];
  stores: Store[];
  branches: Branch[];
  inventory: InventoryStock[];
  orders: SalesOrder[];
  statistics: StatisticsResponse;
};

type MetricBreakdown = {
  label: string;
  value: number;
  unit: string;
  detail: string;
  color: string;
  barClass: string;
};

const months = [
  ["Jan", 1],
  ["Feb", 2],
  ["Mar", 3],
  ["Apr", 4],
  ["May", 5],
  ["Jun", 6],
  ["Jul", 7],
  ["Aug", 8],
  ["Sep", 9],
  ["Oct", 10],
  ["Nov", 11],
  ["Dec", 12],
] as const;
const years = [2025, 2026];
const metricColors = ["#2563eb", "#f59e0b", "#8b5cf6", "#14b8a6"];

export default function DashboardPage() {
  const { t } = usePreferences();
  const [period, setPeriod] = useState<StatisticsPeriod>("week");
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2026);
  const loadDashboard = useCallback(
    async (token: string): Promise<DashboardPayload> => {
      const [products, stores, branches, inventory, orders, statistics] =
        await Promise.all([
          api.products(token),
          api.stores(token),
          api.branches(token),
          api.inventory(token),
          api.salesOrders(token),
          api.statistics(token, { period, month, year }),
        ]);

      return { products, stores, branches, inventory, orders, statistics };
    },
    [month, period, year],
  );
  const { data, error, isLoading, reload } = useApiResource(
    loadDashboard,
    `dashboard:overview:${period}:${month}:${year}`,
  );
  const orders = data?.orders ?? [];
  const products = data?.products ?? [];
  const inventory = data?.inventory ?? [];
  const statistics = data?.statistics;
  const recentOrders = orders.slice(0, 5);
  const attentionProducts = products
    .map((product) => ({ product, stock: productStock(product, inventory) }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  const rangeLabel = statistics
    ? `${statistics.startDate} - ${statistics.endDate}`
    : "";
  const breakdown = useMemo(
    () => (statistics ? createMetricBreakdown(statistics) : []),
    [statistics],
  );
  const topRevenueDays = useMemo(
    () =>
      statistics
        ? [...statistics.series]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 4)
        : [],
    [statistics],
  );
  const topEfficiencyDays = useMemo(
    () =>
      statistics
        ? [...statistics.series]
            .map((item) => ({
              ...item,
              average: item.revenue / Math.max(item.orderCount, 1),
            }))
            .sort((a, b) => b.average - a.average)
            .slice(0, 4)
        : [],
    [statistics],
  );

  return (
    <DashboardShell
      title={t("dashboardTitle")}
      description={t("dashboardDescription")}
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <PeriodControls
            period={period}
            setPeriod={setPeriod}
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
          />
          <PageAction>
            <Plus size={16} /> {t("newSale")}
          </PageAction>
        </div>
      }
    >
      <ResourceState
        isLoading={isLoading}
        error={error}
        isEmpty={!data || !statistics}
        emptyTitle={t("empty")}
        emptyDescription={t("emptyDescription")}
        forbiddenTitle={t("forbidden")}
        forbiddenDescription={t("forbiddenDescription")}
        errorTitle={t("requestFailed")}
        retryLabel={t("retry")}
        onRetry={reload}
      >
        {statistics ? (
          <>
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                    Statistics detail dashboard
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {rangeLabel}. Data comes from the seeded statistics table and
                    updates when you switch week, month, or year.
                  </p>
                </div>
                <Badge tone="blue">Database statistics</Badge>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Total revenue"
                  value={formatCurrency(statistics.totals.revenue)}
                  note="All money earned in the selected period."
                />
                <SummaryCard
                  label="Orders"
                  value={String(statistics.totals.orderCount)}
                  note={`${statistics.totals.customerCount} customer visits recorded.`}
                />
                <SummaryCard
                  label="Units sold"
                  value={String(statistics.totals.unitsSold)}
                  note="How many product units moved through orders."
                />
                <SummaryCard
                  label="Average order"
                  value={formatCurrency(
                    statistics.totals.revenue /
                      Math.max(statistics.totals.orderCount, 1),
                  )}
                  note="Revenue divided by total order count."
                />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Metric category summary
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  These cards split the same period into operational categories,
                  so a viewer can quickly understand whether the graph is driven
                  by orders, product buying, customers, or returns.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  {breakdown.map((item) => (
                    <MetricCard key={item.label} item={item} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
              <ChartPanel
                icon={<BarChart3 size={16} />}
                title="Daily operations stack"
                description="This stacked graph separates each day into orders, product buys, customers, and returns. It is easier to read than one total because you can see which operation created the spike."
                detail={`Highest revenue day: ${topRevenueDays[0]?.date ?? "-"} at ${formatCurrency(topRevenueDays[0]?.revenue ?? 0)}.`}
              >
                <StackedActivityChart statistics={statistics} />
              </ChartPanel>

              <ChartPanel
                icon={<ChartPie size={16} />}
                title="Operational share"
                description="This donut chart shows the share of the selected period by activity type. Use it to understand whether the workload is mostly orders, buying, customers, or returns."
                detail={`${statistics.totals.productReturnCount} returns against ${statistics.totals.productBuyCount} product buys.`}
              >
                <DonutShareChart breakdown={breakdown.slice(0, 4)} />
              </ChartPanel>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <RankPanel
                title="Highest revenue days"
                description="Ranked by total money earned. This tells users which days deserve review for campaigns, demand, or branch staffing."
                rows={topRevenueDays.map((item) => ({
                  label: item.date,
                  meta: `${item.orderCount} orders - ${item.unitsSold} units`,
                  value: formatCurrency(item.revenue),
                  percent:
                    item.revenue /
                    Math.max(topRevenueDays[0]?.revenue ?? item.revenue, 1),
                }))}
              />
              <RankPanel
                title="Best average order days"
                description="Ranked by revenue per order. This helps separate high-value baskets from days that were only busy."
                rows={topEfficiencyDays.map((item) => ({
                  label: item.date,
                  meta: `${formatCurrency(item.revenue)} revenue`,
                  value: formatCurrency(item.average),
                  percent:
                    item.average /
                    Math.max(topEfficiencyDays[0]?.average ?? item.average, 1),
                }))}
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <Section title={t("recentOrders")} aside={<Badge tone="blue">Live</Badge>}>
                <DataTable
                  columns={[t("order"), t("customer"), t("branch"), t("total"), t("status")]}
                  rows={recentOrders.map((order) => [
                    <span key="number" className="font-semibold text-slate-950 dark:text-slate-50">
                      {order.orderNumber}
                    </span>,
                    order.customer?.name ?? "-",
                    order.branch?.name ?? "-",
                    formatCurrency(order.totalAmount),
                    <Badge key="status" tone={order.status === "COMPLETED" ? "emerald" : "amber"}>
                      {order.status}
                    </Badge>,
                  ])}
                />
              </Section>

              <Section title={t("operationsFeed")}>
                <div className="space-y-4">
                  {recentOrders.slice(0, 4).map((order, index) => (
                    <div key={order.id} className="flex gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        {index === 0 ? (
                          <ShoppingCart size={16} />
                        ) : index === 1 ? (
                          <PackageCheck size={16} />
                        ) : (
                          <Activity size={16} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {order.orderNumber} - {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!recentOrders.length ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("emptyDescription")}
                    </p>
                  ) : null}
                </div>
              </Section>
            </div>

            <div className="mt-6">
              <Section
                title={t("productsAttention")}
                aside={<ArrowUpRight size={16} className="text-slate-400" />}
              >
                <DataTable
                  columns={[t("sku"), t("product"), t("category"), t("stock"), t("price"), t("status")]}
                  rows={attentionProducts.map(({ product, stock }) => [
                    product.sku,
                    <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">
                      {product.name}
                    </span>,
                    product.category?.name ?? "-",
                    stock,
                    formatCurrency(product.price),
                    <Badge key="status" tone={stock <= 10 ? "amber" : "emerald"}>
                      {stock <= 10 ? t("reorder") : t("healthy")}
                    </Badge>,
                  ])}
                />
              </Section>
            </div>
          </>
        ) : null}
      </ResourceState>
    </DashboardShell>
  );
}

function PeriodControls({
  period,
  setPeriod,
  month,
  setMonth,
  year,
  setYear,
}: {
  period: StatisticsPeriod;
  setPeriod: (period: StatisticsPeriod) => void;
  month: number;
  setMonth: (month: number) => void;
  year: number;
  setYear: (year: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex h-10 overflow-hidden rounded-md border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {(["week", "month", "year"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPeriod(item)}
            className={`cursor-pointer px-4 capitalize transition ${
              period === item
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      {period === "month" ? (
        <select
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          className="h-10 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
        >
          {months.map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : null}
      {period !== "week" ? (
        <select
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
          className="h-10 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
        {value}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {note}
      </p>
    </div>
  );
}

function MetricCard({ item }: { item: MetricBreakdown }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {item.label}
        </span>
      </div>
      <dl className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">Value</dt>
          <dd className="font-semibold text-slate-950 dark:text-slate-50">
            {item.value.toLocaleString()} {item.unit}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">Meaning</dt>
          <dd className="text-right font-semibold text-slate-950 dark:text-slate-50">
            {item.detail}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ChartPanel({
  icon,
  title,
  description,
  detail,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold text-slate-950 dark:text-slate-50">
            <span className="text-slate-400">{icon}</span>
            {title}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {detail}
          </p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StackedActivityChart({ statistics }: { statistics: StatisticsResponse }) {
  const max = Math.max(
    ...statistics.series.map(
      (item) =>
        item.orderCount +
        item.productBuyCount +
        item.customerCount +
        item.productReturnCount,
    ),
    1,
  );
  const ticks = [max, Math.round(max * 0.66), Math.round(max * 0.33), 0];

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {["Orders", "Product buys", "Customers", "Returns"].map((label, index) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: metricColors[index] }}
            />
            {label}
          </span>
        ))}
      </div>
      <div className="grid h-80 grid-cols-[44px_1fr] gap-3 rounded-md bg-slate-50 p-4 dark:bg-slate-900">
        <div className="flex flex-col justify-between text-right text-[11px] font-medium text-slate-400">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="flex items-end gap-1 border-l border-b border-slate-200 pl-3 dark:border-slate-800">
          {statistics.series.map((item, index) => {
            const segments = [
              item.orderCount,
              item.productBuyCount,
              item.customerCount,
              item.productReturnCount,
            ];
            const total = segments.reduce((sum, value) => sum + value, 0);

            return (
              <div
                key={item.date}
                className="flex min-w-[10px] flex-1 flex-col justify-end overflow-hidden rounded-t"
                title={`${item.date}: ${total} activity points`}
                style={{ height: `${Math.max(8, (total / max) * 100)}%` }}
              >
                {segments.map((value, segmentIndex) => (
                  <span
                    key={segmentIndex}
                    style={{
                      height: `${Math.max(4, (value / Math.max(total, 1)) * 100)}%`,
                      backgroundColor: metricColors[segmentIndex],
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{statistics.series[0]?.date}</span>
        <span>{statistics.series[statistics.series.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function DonutShareChart({ breakdown }: { breakdown: MetricBreakdown[] }) {
  const total = breakdown.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;
  const gradient = breakdown
    .map((item, index) => {
      const start = cursor;
      const end = cursor + (item.value / total) * 360;
      cursor = end;
      return `${metricColors[index]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="grid min-h-80 items-center gap-6">
      <div className="mx-auto grid h-52 w-52 place-items-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="grid h-28 w-28 place-items-center rounded-full border border-slate-200 bg-white text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total activity
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">
              {total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {breakdown.map((item, index) => {
          const percent = (item.value / total) * 100;

          return (
            <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 text-sm last:border-0 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: metricColors[index] }}
                />
                {item.label}
              </span>
              <span className="text-right font-semibold text-slate-950 dark:text-slate-50">
                {percent.toFixed(1)}% · {item.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RankPanel({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<{ label: string; meta: string; value: string; percent: number }>;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <div className="mt-5 space-y-4">
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {index + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                    {row.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {row.meta}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                {row.value}
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                style={{ width: `${Math.max(8, Math.min(100, row.percent * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function createMetricBreakdown(statistics: StatisticsResponse): MetricBreakdown[] {
  return [
    {
      label: "Orders",
      value: statistics.totals.orderCount,
      unit: "orders",
      detail: "sales workload",
      color: metricColors[0],
      barClass: "bg-blue-600",
    },
    {
      label: "Product buys",
      value: statistics.totals.productBuyCount,
      unit: "items",
      detail: "buying demand",
      color: metricColors[1],
      barClass: "bg-amber-500",
    },
    {
      label: "Customers",
      value: statistics.totals.customerCount,
      unit: "visits",
      detail: "traffic signal",
      color: metricColors[2],
      barClass: "bg-violet-500",
    },
    {
      label: "Returns",
      value: statistics.totals.productReturnCount,
      unit: "returns",
      detail: "risk signal",
      color: metricColors[3],
      barClass: "bg-teal-500",
    },
    {
      label: "Units sold",
      value: statistics.totals.unitsSold,
      unit: "units",
      detail: "stock movement",
      color: "#0f766e",
      barClass: "bg-teal-700",
    },
  ];
}
