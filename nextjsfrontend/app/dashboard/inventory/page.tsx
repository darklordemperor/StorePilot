"use client";

import { Boxes, Download } from "lucide-react";
import { useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type { InventoryStock } from "@/lib/api";
import { formatCurrency, inventoryValue, lowStockCount, totalInventoryValue } from "@/lib/dashboard-data";
import { useApiResource } from "@/lib/use-api-resource";

export default function InventoryPage() {
  const { t } = usePreferences();
  const loadInventory = useCallback((token: string) => api.inventory(token), []);
  const { data, error, isLoading, reload } = useApiResource<InventoryStock[]>(loadInventory, "dashboard:inventory");
  const inventory = data ?? [];

  return (
    <DashboardShell
      title={t("inventory")}
      description={t("inventoryDescription")}
      action={<PageAction><Download size={16} /> {t("export")}</PageAction>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("value")} value={formatCurrency(totalInventoryValue(inventory))} change={t("active")} tone="emerald" />
        <StatCard label={t("reorder")} value={String(lowStockCount(inventory))} change={t("reorderLevel")} tone="amber" />
        <StatCard label={t("stock")} value={String(inventory.reduce((total, item) => total + item.quantity, 0))} change={t("onHand")} tone="blue" />
      </div>

      <div className="mt-6">
        <Section title={t("branchStock")} aside={<Boxes size={16} className="text-slate-400" />}>
          <ResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={!inventory.length}
            emptyTitle={t("empty")}
            emptyDescription={t("emptyDescription")}
            forbiddenTitle={t("forbidden")}
            forbiddenDescription={t("forbiddenDescription")}
            errorTitle={t("requestFailed")}
            retryLabel={t("retry")}
            onRetry={reload}
          >
            <DataTable
              columns={[t("product"), t("branch"), t("onHand"), t("reorderLevel"), t("value"), t("status")]}
              rows={inventory.map((item) => [
                <span key="product" className="font-semibold text-slate-950 dark:text-slate-50">{item.product?.name ?? item.productId}</span>,
                item.branch?.name ?? item.branchId,
                item.quantity,
                10,
                formatCurrency(inventoryValue(item)),
                <Badge key="status" tone={item.quantity <= 10 ? "amber" : "emerald"}>
                  {item.quantity <= 10 ? t("reorder") : t("healthy")}
                </Badge>,
              ])}
            />
          </ResourceState>
        </Section>
      </div>

      <div className="mt-6">
        <Section title={t("transferQueue")}>
          <EmptyState
            title={t("noTransfers")}
            description={t("noTransfersDescription")}
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
