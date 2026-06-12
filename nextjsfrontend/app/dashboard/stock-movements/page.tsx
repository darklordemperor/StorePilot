"use client";

import { Plus, Shuffle, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, PageAction, Section } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api, ApiError } from "@/lib/api";
import type { Branch, Product, StockMovement } from "@/lib/api";
import { formatDateTime, movementQuantity } from "@/lib/dashboard-data";
import { canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

export default function StockMovementsPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const canEdit = canManage(auth?.user.role);
  const canDelete = auth?.user.role === "OWNER";
  const loadMovements = useCallback(async (token: string) => {
    const [movements, products, branches] = await Promise.all([
      api.stockMovements(token),
      api.products(token),
      api.branches(token),
    ]);
    return { movements, products, branches };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadMovements, "dashboard:stock-movements");
  const movements = data?.movements ?? [];
  const products: Product[] = data?.products ?? [];
  const branches: Branch[] = data?.branches ?? [];
  const [form, setForm] = useState({ type: "IN" as const, quantity: "", note: "" });
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function createMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.accessToken || !products[0] || !branches[0]) return;
    setActionError("");
    setIsSaving(true);
    try {
      await api.createStockMovement(auth.accessToken, {
        type: form.type,
        quantity: Number(form.quantity),
        productId: products[0].id,
        branchId: branches[0].id,
        note: form.note || undefined,
      });
      setForm({ type: "IN", quantity: "", note: "" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteMovement(id: string) {
    if (!auth?.accessToken) return;
    try {
      await api.deleteStockMovement(auth.accessToken, id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

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
              columns={[t("type"), t("product"), t("branch"), t("quantity"), t("user"), t("time"), canDelete ? t("actions") : t("status")]}
              rows={movements.map((movement) => {
                const qty = movementQuantity(movement);
                return [
                  <Badge key="type" tone={movement.type === "IN" || movement.type === "RETURN" ? "emerald" : movement.type === "ADJUSTMENT" ? "amber" : "rose"}>{movement.type}</Badge>,
                  movement.product?.name ?? movement.productId,
                  movement.branch?.name ?? movement.branchId,
                  <span key="qty" className={qty.startsWith("+") ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>{qty}</span>,
                  movement.user?.name ?? "-",
                  formatDateTime(movement.createdAt),
                  canDelete ? (
                    <button key="delete" onClick={() => deleteMovement(movement.id)} title={t("delete")} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-500">
                      <Trash2 size={14} /> {t("delete")}
                    </button>
                  ) : t("active"),
                ];
              })}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("recordMovement")}>
            <form onSubmit={createMovement} className="space-y-4">
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">{products[0]?.name ?? t("product")} · {branches[0]?.name ?? t("branch")}</div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("type")}<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as typeof form.type }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"><option value="IN">IN</option><option value="OUT">OUT</option><option value="ADJUSTMENT">ADJUSTMENT</option><option value="RETURN">RETURN</option></select></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("quantity")}<input required type="number" min="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note<input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
              <button disabled={isSaving || !products.length || !branches.length} className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">{isSaving ? t("loading") : t("recordMovement")}</button>
            </form>
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
