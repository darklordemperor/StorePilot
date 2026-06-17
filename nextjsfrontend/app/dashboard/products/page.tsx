"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, PageAction, Section } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { InventoryStock, Product, Store } from "@/lib/api";
import { formatCurrency, productStock } from "@/lib/dashboard-data";
import { canDeleteOwnerOnly, canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

type ProductsPayload = {
  products: Product[];
  inventory: InventoryStock[];
  stores: Store[];
};

export default function ProductsPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const loadProducts = useCallback(async (token: string): Promise<ProductsPayload> => {
    const [products, inventory, stores] = await Promise.all([
      api.products(token),
      api.inventory(token),
      api.stores(token),
    ]);
    return { products, inventory, stores };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadProducts, "dashboard:products");
  const products = data?.products ?? [];
  const inventory = data?.inventory ?? [];
  const stores = data?.stores ?? [];
  const canEdit = canManage(auth?.user.role);
  const canDelete = canDeleteOwnerOnly(auth?.user.role);
  const [form, setForm] = useState({ name: "", sku: "", price: "", cost: "" });
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.accessToken || !stores[0]) {
      setActionError(t("requestFailed"));
      return;
    }

    setActionError("");
    setIsSaving(true);

    try {
      await api.createProduct(auth.accessToken, {
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        cost: form.cost ? Number(form.cost) : undefined,
        storeId: stores[0].id,
        isActive: true,
      });
      setForm({ name: "", sku: "", price: "", cost: "" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!auth?.accessToken) return;
    setActionError("");
    try {
      await api.deleteProduct(auth.accessToken, id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

  return (
    <DashboardShell
      title={t("products")}
      description={t("productDescription")}
      action={canEdit ? <PageAction><Plus size={16} /> {t("addProduct")}</PageAction> : null}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title={t("productCatalog")} aside={<Search size={16} className="text-slate-400" />}>
          <ResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={!products.length}
            emptyTitle={t("empty")}
            emptyDescription={t("emptyDescription")}
            forbiddenTitle={t("forbidden")}
            forbiddenDescription={t("forbiddenDescription")}
            errorTitle={t("requestFailed")}
            retryLabel={t("retry")}
            onRetry={reload}
          >
            <DataTable
              columns={[t("sku"), t("product"), t("category"), t("stock"), t("price"), t("status"), canDelete ? "" : t("readOnly")]}
              rows={products.map((product) => {
                const stock = productStock(product, inventory);
                return [
                  product.sku,
                  <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">{product.name}</span>,
                  product.category?.name ?? "-",
                  stock,
                  formatCurrency(product.price),
                  <Badge key="status" tone={product.isActive ? "emerald" : "slate"}>{product.isActive ? t("active") : t("inactive")}</Badge>,
                  canDelete ? (
                    <button key="delete" onClick={() => deleteProduct(product.id)} title={t("delete")} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-500">
                      <Trash2 size={14} /> {t("delete")}
                    </button>
                  ) : <Badge key="role" tone="slate">{t("readOnly")}</Badge>,
                ];
              })}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("productDetails")}>
            <form onSubmit={createProduct} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("name")}
                <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("sku")}
                <input required value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("price")}
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("cost")}
                  <input type="number" min="0" step="0.01" value={form.cost} onChange={(event) => setForm((current) => ({ ...current, cost: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
                </label>
              </div>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
              <button disabled={isSaving || !stores.length} className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">{isSaving ? t("loading") : t("saveProduct")}</button>
            </form>
          </Section>
        ) : (
          <Section title={t("productDetails")}>
            <EmptyState title={t("readOnly")} description={t("forbiddenDescription")} />
          </Section>
        )}
      </div>

      <div className="mt-6">
        <Section title={t("archivedProducts")}>
          <EmptyState
            title={t("noArchivedProducts")}
            description={t("noArchivedProductsDescription")}
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
