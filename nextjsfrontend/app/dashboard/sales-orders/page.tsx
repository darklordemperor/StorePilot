"use client";

import { Plus, ReceiptText } from "lucide-react";
import { useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, Field, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type { SalesOrder } from "@/lib/api";
import { formatCurrency, totalSales } from "@/lib/dashboard-data";
import { canCreateSales, canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

export default function SalesOrdersPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const canCreate = canCreateSales(auth?.user.role);
  const canEdit = canManage(auth?.user.role);
  const loadOrders = useCallback((token: string) => api.salesOrders(token), []);
  const { data, error, isLoading, reload } = useApiResource<SalesOrder[]>(loadOrders, "dashboard:sales-orders");
  const orders = data ?? [];
  const draftCount = orders.filter((order) => order.status === "DRAFT").length;
  const averageOrder = orders.length ? totalSales(orders) / orders.length : 0;

  return (
    <DashboardShell
      title={t("salesOrders")}
      description={t("salesOrdersDescription")}
      action={canCreate ? <PageAction><Plus size={16} /> {t("newOrder")}</PageAction> : null}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("salesOrders")} value={formatCurrency(totalSales(orders))} change={t("completed")} tone="emerald" />
        <StatCard label={t("averageOrder")} value={formatCurrency(averageOrder)} change={String(orders.length)} tone="blue" />
        <StatCard label={t("draft")} value={String(draftCount)} change={t("status")} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title={t("orderQueue")} aside={<ReceiptText size={16} className="text-slate-400" />}>
          <ResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={!orders.length}
            emptyTitle={t("empty")}
            emptyDescription={t("emptyDescription")}
            forbiddenTitle={t("forbidden")}
            forbiddenDescription={t("forbiddenDescription")}
            errorTitle={t("requestFailed")}
            retryLabel={t("retry")}
            onRetry={reload}
          >
            <DataTable
              columns={[t("order"), t("customer"), t("branch"), t("total"), t("status"), canEdit ? t("management") : t("readOnly")]}
              rows={orders.map((order) => [
                <span key="number" className="font-semibold text-slate-950 dark:text-slate-50">{order.orderNumber}</span>,
                order.customer?.name ?? "-",
                order.branch?.name ?? "-",
                formatCurrency(order.totalAmount),
                <Badge key="status" tone={order.status === "COMPLETED" ? "emerald" : order.status === "DRAFT" ? "amber" : "rose"}>{order.status}</Badge>,
                canEdit ? t("management") : t("readOnly"),
              ])}
            />
          </ResourceState>
        </Section>

        {canCreate ? (
          <Section title={t("createOrder")}>
            <div className="space-y-4">
              <Field label={t("order")} placeholder="SO-1049" />
              <Field label={t("customer")} placeholder="Sora Hotel" />
              <Field label={t("branch")} placeholder="Central Market" />
              <Field label={t("product")} placeholder="Cold Brew Coffee" />
              <Field label={t("quantity")} placeholder="6" />
              <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{t("createOrder")}</button>
            </div>
          </Section>
        ) : (
          <Section title={t("createOrder")}>
            <EmptyState title={t("readOnly")} description={t("forbiddenDescription")} />
          </Section>
        )}
      </div>

      <div className="mt-6">
        <Section title={t("refunds")}>
          <EmptyState
            title={t("noRefunds")}
            description={t("noRefundsDescription")}
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
