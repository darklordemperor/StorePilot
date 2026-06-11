"use client";

import { Plus, Shuffle } from "lucide-react";
import { useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, Field, PageAction, Section } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type { StockMovement } from "@/lib/api";
import { formatDateTime, movementQuantity } from "@/lib/dashboard-data";
import { canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

export default function StockMovementsPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const canEdit = canManage(auth?.user.role);
  const loadMovements = useCallback((token: string) => api.stockMovements(token), []);
  const { data, error, isLoading, reload } = useApiResource<StockMovement[]>(loadMovements, "dashboard:stock-movements");
  const movements = data ?? [];

  return (
    <DashboardShell
      title={t("stockMovements")}
      description={t("stockMovementsDescription")}
      action={canEdit ? <PageAction><Plus size={16} /> {t("newMovement")}</PageAction> : null}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title={t("movementLedger")} aside={<Shuffle size={16} className="text-slate-400" />}>
          <ResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={!movements.length}
            emptyTitle={t("empty")}
            emptyDescription={t("emptyDescription")}
            forbiddenTitle={t("forbidden")}
            forbiddenDescription={t("forbiddenDescription")}
            errorTitle={t("requestFailed")}
            retryLabel={t("retry")}
            onRetry={reload}
          >
            <DataTable
              columns={[t("type"), t("product"), t("branch"), t("quantity"), t("user"), t("time")]}
              rows={movements.map((movement) => {
                const qty = movementQuantity(movement);
                return [
                  <Badge key="type" tone={movement.type === "IN" || movement.type === "RETURN" ? "emerald" : movement.type === "ADJUSTMENT" ? "amber" : "rose"}>{movement.type}</Badge>,
                  movement.product?.name ?? movement.productId,
                  movement.branch?.name ?? movement.branchId,
                  <span key="qty" className={qty.startsWith("+") ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>{qty}</span>,
                  movement.user?.name ?? "-",
                  formatDateTime(movement.createdAt),
                ];
              })}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("recordMovement")}>
            <div className="space-y-4">
              <Field label={t("product")} placeholder="Cold Brew Coffee" />
              <Field label={t("branch")} placeholder="Central Market" />
              <Field label={t("type")} placeholder="IN, OUT, ADJUSTMENT" />
              <Field label={t("quantity")} placeholder="12" />
              <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{t("recordMovement")}</button>
            </div>
          </Section>
        ) : (
          <Section title={t("recordMovement")}>
            <EmptyState title={t("readOnly")} description={t("forbiddenDescription")} />
          </Section>
        )}
      </div>
    </DashboardShell>
  );
}
