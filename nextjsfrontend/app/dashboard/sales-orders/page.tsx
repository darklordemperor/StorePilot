"use client";

import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api, ApiError } from "@/lib/api";
import type { Branch, Customer, InventoryStock, Product, SalesOrder, Store } from "@/lib/api";
import { formatCurrency, totalSales } from "@/lib/dashboard-data";
import { canCreateSales, canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

type SalesOrdersPayload = {
  orders: SalesOrder[];
  stores: Store[];
  branches: Branch[];
  products: Product[];
  customers: Customer[];
  inventory: InventoryStock[];
};

export default function SalesOrdersPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const canCreate = canCreateSales(auth?.user.role);
  const canEdit = canManage(auth?.user.role);
  const canDelete = auth?.user.role === "OWNER";
  const loadOrders = useCallback(async (token: string): Promise<SalesOrdersPayload> => {
    const [orders, stores, branches, products, customers, inventory] = await Promise.all([
      api.salesOrders(token),
      api.stores(token),
      api.branches(token),
      api.products(token),
      api.customers(token),
      api.inventory(token),
    ]);

    return { orders, stores, branches, products, customers, inventory };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadOrders, "dashboard:sales-orders");
  const orders = data?.orders ?? [];
  const stores = data?.stores ?? [];
  const branches = data?.branches ?? [];
  const products = data?.products ?? [];
  const customers = data?.customers ?? [];
  const inventory = data?.inventory ?? [];
  const [form, setForm] = useState({
    orderNumber: "",
    quantity: "1",
    status: "COMPLETED" as "DRAFT" | "COMPLETED",
    productId: "",
    branchId: "",
    customerId: "",
  });
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const draftCount = orders.filter((order) => order.status === "DRAFT").length;
  const averageOrder = orders.length ? totalSales(orders) / orders.length : 0;
  const selectedProduct = products.find((product) => product.id === form.productId) ?? products[0];
  const selectedBranch = branches.find((branch) => branch.id === form.branchId) ?? branches[0];
  const selectedCustomer = customers.find((customer) => customer.id === form.customerId) ?? customers[0];
  const availableStock =
    inventory.find(
      (item) => item.productId === selectedProduct?.id && item.branchId === selectedBranch?.id,
    )?.quantity ?? 0;

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!auth?.accessToken || !stores[0] || !selectedBranch || !selectedProduct) {
      return;
    }

    const quantity = Number(form.quantity);
    setActionError("");

    if (form.status === "COMPLETED" && quantity > availableStock) {
      setActionError(`Not enough stock. Available stock is ${availableStock}.`);
      return;
    }

    setIsSaving(true);

    try {
      await api.createSalesOrder(auth.accessToken, {
        orderNumber: form.orderNumber,
        status: form.status,
        storeId: stores[0].id,
        branchId: selectedBranch.id,
        customerId: selectedCustomer?.id,
        items: [
          {
            productId: selectedProduct.id,
            quantity,
            unitPrice: Number(selectedProduct.price),
          },
        ],
      });
      setForm({
        orderNumber: "",
        quantity: "1",
        status: "COMPLETED",
        productId: "",
        branchId: "",
        customerId: "",
      });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function approveOrder(order: SalesOrder) {
    if (!auth?.accessToken) return;

    try {
      await api.updateSalesOrder(auth.accessToken, order.id, { status: "COMPLETED" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

  async function deleteOrder(id: string) {
    if (!auth?.accessToken) return;

    try {
      await api.deleteSalesOrder(auth.accessToken, id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

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
                canDelete ? (
                  <button key="delete" onClick={() => deleteOrder(order.id)} title="Delete order" className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-500">
                    <Trash2 size={14} /> Delete
                  </button>
                ) : canEdit && order.status === "DRAFT" ? (
                  <button key="approve" onClick={() => approveOrder(order)} className="font-semibold text-emerald-600 hover:text-emerald-500">Approve</button>
                ) : canEdit ? t("management") : t("readOnly"),
              ])}
            />
          </ResourceState>
        </Section>

        {canCreate ? (
          <Section title={t("createOrder")}>
            <form onSubmit={createOrder} className="space-y-4">
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {selectedProduct?.name ?? t("product")} - {selectedBranch?.name ?? t("branch")} - Stock {availableStock}
              </div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("order")}
                <input required value={form.orderNumber} onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))} placeholder="SO-1049" className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("product")}
                <select value={selectedProduct?.id ?? ""} onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("branch")}
                <select value={selectedBranch?.id ?? ""} onChange={(event) => setForm((current) => ({ ...current, branchId: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
                  {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("customer")}
                <select value={selectedCustomer?.id ?? ""} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("quantity")}
                <input required type="number" min="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("status")}
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "DRAFT" | "COMPLETED" }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </label>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
              <button disabled={isSaving || !stores.length || !branches.length || !products.length} className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">{isSaving ? t("loading") : t("createOrder")}</button>
            </form>
          </Section>
        ) : (
          <Section title={t("createOrder")}>
            <EmptyState title={t("readOnly")} description={t("forbiddenDescription")} />
          </Section>
        )}
      </div>

      <div className="mt-6">
        <Section title={t("refunds")}>
          <EmptyState title={t("noRefunds")} description={t("noRefundsDescription")} />
        </Section>
      </div>
    </DashboardShell>
  );
}
