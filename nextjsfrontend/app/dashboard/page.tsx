"use client";

import { Activity, ArrowUpRight, PackageCheck, Plus, ShoppingCart } from "lucide-react";
import { useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type { Branch, InventoryStock, Product, SalesOrder, Store } from "@/lib/api";
import {
  activeBranchCount,
  formatCurrency,
  formatDateTime,
  lowStockCount,
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
};

export default function DashboardPage() {
  const { t } = usePreferences();
  const loadDashboard = useCallback(async (token: string): Promise<DashboardPayload> => {
    const [products, stores, branches, inventory, orders] = await Promise.all([
      api.products(token),
      api.stores(token),
      api.branches(token),
      api.inventory(token),
      api.salesOrders(token),
    ]);

    return { products, stores, branches, inventory, orders };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadDashboard, "dashboard:overview");
  const orders = data?.orders ?? [];
  const products = data?.products ?? [];
  const inventory = data?.inventory ?? [];
  const recentOrders = orders.slice(0, 5);
  const attentionProducts = products
    .map((product) => ({ product, stock: productStock(product, inventory) }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <DashboardShell
      title={t("dashboardTitle")}
      description={t("dashboardDescription")}
      action={<PageAction><Plus size={16} /> {t("newSale")}</PageAction>}
    >
      <ResourceState
        isLoading={isLoading}
        error={error}
        isEmpty={!data}
        emptyTitle={t("empty")}
        emptyDescription={t("emptyDescription")}
        forbiddenTitle={t("forbidden")}
        forbiddenDescription={t("forbiddenDescription")}
        errorTitle={t("requestFailed")}
        retryLabel={t("retry")}
        onRetry={reload}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t("revenue")} value={formatCurrency(totalSales(orders))} change={t("completed")} tone="emerald" />
          <StatCard label={t("salesOrders")} value={String(orders.length)} change={t("active")} tone="blue" />
          <StatCard label={t("stock")} value={String(lowStockCount(inventory))} change={t("reorder")} tone="amber" />
          <StatCard label={t("branch")} value={String(activeBranchCount(data?.stores ?? [], data?.branches ?? []))} change={t("active")} tone="rose" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Section title={t("recentOrders")} aside={<Badge tone="blue">Live</Badge>}>
            <ResourceState
              isLoading={false}
              error={null}
              isEmpty={!recentOrders.length}
              emptyTitle={t("empty")}
              emptyDescription={t("emptyDescription")}
              forbiddenTitle={t("forbidden")}
              forbiddenDescription={t("forbiddenDescription")}
              errorTitle={t("requestFailed")}
              retryLabel={t("retry")}
              onRetry={reload}
            >
              <DataTable
                columns={[t("order"), t("customer"), t("branch"), t("total"), t("status")]}
                rows={recentOrders.map((order) => [
                  <span key="number" className="font-semibold text-slate-950 dark:text-slate-50">{order.orderNumber}</span>,
                  order.customer?.name ?? "-",
                  order.branch?.name ?? "-",
                  formatCurrency(order.totalAmount),
                  <Badge key="status" tone={order.status === "COMPLETED" ? "emerald" : "amber"}>{order.status}</Badge>,
                ])}
              />
            </ResourceState>
          </Section>

          <Section title={t("operationsFeed")}>
            <div className="space-y-4">
              {recentOrders.slice(0, 4).map((order, index) => (
                <div key={order.id} className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {index === 0 ? <ShoppingCart size={16} /> : index === 1 ? <PackageCheck size={16} /> : <Activity size={16} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{order.orderNumber} · {formatCurrency(order.totalAmount)}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(order.createdAt)}</div>
                  </div>
                </div>
              ))}
              {!recentOrders.length ? <p className="text-sm text-slate-500 dark:text-slate-400">{t("emptyDescription")}</p> : null}
            </div>
          </Section>
        </div>

        <div className="mt-6">
          <Section title={t("productsAttention")} aside={<ArrowUpRight size={16} className="text-slate-400" />}>
            <ResourceState
              isLoading={false}
              error={null}
              isEmpty={!attentionProducts.length}
              emptyTitle={t("empty")}
              emptyDescription={t("emptyDescription")}
              forbiddenTitle={t("forbidden")}
              forbiddenDescription={t("forbiddenDescription")}
              errorTitle={t("requestFailed")}
              retryLabel={t("retry")}
              onRetry={reload}
            >
              <DataTable
                columns={[t("sku"), t("product"), t("category"), t("stock"), t("price"), t("status")]}
                rows={attentionProducts.map(({ product, stock }) => [
                  product.sku,
                  <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">{product.name}</span>,
                  product.category?.name ?? "-",
                  stock,
                  formatCurrency(product.price),
                  <Badge key="status" tone={stock <= 10 ? "amber" : "emerald"}>{stock <= 10 ? t("reorder") : t("healthy")}</Badge>,
                ])}
              />
            </ResourceState>
          </Section>
        </div>
      </ResourceState>
    </DashboardShell>
  );
}
