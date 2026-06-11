"use client";

import { Plus, Users } from "lucide-react";
import { useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, EmptyState, Field, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type { Customer, SalesOrder } from "@/lib/api";
import { customerSpend, formatCurrency } from "@/lib/dashboard-data";
import { canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

type CustomersPayload = {
  customers: Customer[];
  orders: SalesOrder[];
};

export default function CustomersPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const canEdit = canManage(auth?.user.role);
  const loadCustomers = useCallback(async (token: string): Promise<CustomersPayload> => {
    const [customers, orders] = await Promise.all([api.customers(token), api.salesOrders(token)]);
    return { customers, orders };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadCustomers, "dashboard:customers");
  const customers = data?.customers ?? [];
  const orders = data?.orders ?? [];
  const topCustomer = customers
    .map((customer) => ({ customer, spend: customerSpend(customer, orders) }))
    .sort((a, b) => b.spend - a.spend)[0];

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
              columns={[t("customer"), t("email"), t("phone"), t("lifetimeSpend")]}
              rows={customers.map((customer) => [
                <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">{customer.name}</span>,
                customer.email ?? "-",
                customer.phone ?? "-",
                formatCurrency(customerSpend(customer, orders)),
              ])}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("customerProfile")}>
            <div className="space-y-4">
              <Field label={t("name")} placeholder="Lina Wholesale" />
              <Field label={t("email")} placeholder="orders@lina.example" />
              <Field label={t("phone")} placeholder="+66 80 222 1400" />
              <Field label={t("address")} placeholder="Business address" />
              <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{t("saveCustomer")}</button>
            </div>
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
