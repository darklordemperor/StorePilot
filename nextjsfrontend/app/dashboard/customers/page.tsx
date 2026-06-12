"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, EmptyState, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api, ApiError } from "@/lib/api";
import type { Customer, SalesOrder, Store } from "@/lib/api";
import { customerSpend, formatCurrency } from "@/lib/dashboard-data";
import { canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

type CustomersPayload = {
  customers: Customer[];
  orders: SalesOrder[];
  stores: Store[];
};

export default function CustomersPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const canEdit = canManage(auth?.user.role);
  const canDelete = auth?.user.role === "OWNER";
  const loadCustomers = useCallback(async (token: string): Promise<CustomersPayload> => {
    const [customers, orders, stores] = await Promise.all([api.customers(token), api.salesOrders(token), api.stores(token)]);
    return { customers, orders, stores };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadCustomers, "dashboard:customers");
  const customers = data?.customers ?? [];
  const orders = data?.orders ?? [];
  const stores = data?.stores ?? [];
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const topCustomer = customers
    .map((customer) => ({ customer, spend: customerSpend(customer, orders) }))
    .sort((a, b) => b.spend - a.spend)[0];

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.accessToken || !stores[0]) return;
    setActionError("");
    setIsSaving(true);
    try {
      await api.createCustomer(auth.accessToken, {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        storeId: stores[0].id,
      });
      setForm({ name: "", email: "", phone: "", address: "" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCustomer(id: string) {
    if (!auth?.accessToken) return;
    try {
      await api.deleteCustomer(auth.accessToken, id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

  return (
    <DashboardShell
      title={t("customers")}
      description={t("customersDescription")}
      action={canEdit ? <PageAction><Plus size={16} /> {t("addCustomer")}</PageAction> : null}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("customers")} value={String(customers.length)} change={t("active")} tone="emerald" />
        <StatCard label={t("salesOrders")} value={String(orders.length)} change={t("completed")} tone="blue" />
        <StatCard label={t("topAccount")} value={topCustomer?.customer.name ?? "-"} change={formatCurrency(topCustomer?.spend ?? 0)} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title={t("customerList")} aside={<Users size={16} className="text-slate-400" />}>
          <ResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={!customers.length}
            emptyTitle={t("empty")}
            emptyDescription={t("emptyDescription")}
            forbiddenTitle={t("forbidden")}
            forbiddenDescription={t("forbiddenDescription")}
            errorTitle={t("requestFailed")}
            retryLabel={t("retry")}
            onRetry={reload}
          >
            <DataTable
              columns={[t("customer"), t("email"), t("phone"), t("lifetimeSpend"), canDelete ? t("actions") : t("status")]}
              rows={customers.map((customer) => [
                <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">{customer.name}</span>,
                customer.email ?? "-",
                customer.phone ?? "-",
                formatCurrency(customerSpend(customer, orders)),
                canDelete ? (
                  <button key="delete" onClick={() => deleteCustomer(customer.id)} title={t("delete")} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-500">
                    <Trash2 size={14} /> {t("delete")}
                  </button>
                ) : t("active"),
              ])}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("customerProfile")}>
            <form onSubmit={createCustomer} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("name")}<input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("email")}<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("phone")}<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("address")}<input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
              <button disabled={isSaving || !stores.length} className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">{isSaving ? t("loading") : t("saveCustomer")}</button>
            </form>
          </Section>
        ) : (
          <Section title={t("customerProfile")}>
            <EmptyState title={t("readOnly")} description={t("forbiddenDescription")} />
          </Section>
        )}
      </div>

      <div className="mt-6">
        <Section title={t("customerSegments")}>
          <EmptyState
            title={t("noSegments")}
            description={t("noSegmentsDescription")}
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
