"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, Field, PageAction, Section } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type { InventoryStock, Product } from "@/lib/api";
import { formatCurrency, productStock } from "@/lib/dashboard-data";
import { canDeleteOwnerOnly, canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

type ProductsPayload = {
  products: Product[];
  inventory: InventoryStock[];
};

export default function ProductsPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const loadProducts = useCallback(async (token: string): Promise<ProductsPayload> => {
    const [products, inventory] = await Promise.all([
      api.products(token),
      api.inventory(token),
    ]);
    return { products, inventory };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadProducts, "dashboard:products");
  const products = data?.products ?? [];
  const inventory = data?.inventory ?? [];
  const canEdit = canManage(auth?.user.role);
  const canDelete = canDeleteOwnerOnly(auth?.user.role);

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
                  canDelete ? <button key="delete" title={t("adminOnly")} className="text-rose-600 hover:text-rose-700"><Trash2 size={16} /></button> : <Badge key="role" tone="slate">{t("readOnly")}</Badge>,
                ];
              })}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("productDetails")}>
            <div className="space-y-4">
              <Field label={t("name")} placeholder="Cold Brew Coffee" />
              <Field label={t("sku")} placeholder="CB-001" />
              <Field label={t("category")} placeholder="Beverages" />
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("price")} placeholder="4.50" />
                <Field label={t("cost")} placeholder="2.10" />
              </div>
              <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{t("saveProduct")}</button>
            </div>
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
