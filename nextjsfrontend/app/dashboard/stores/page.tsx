"use client";

import { Building2, MapPin, Plus } from "lucide-react";
import { useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, EmptyState, Field, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api } from "@/lib/api";
import type { Branch, Store } from "@/lib/api";
import { activeBranchCount } from "@/lib/dashboard-data";
import { canDeleteOwnerOnly, canManage } from "@/lib/roles";
import { useApiResource } from "@/lib/use-api-resource";

type StoresPayload = {
  stores: Store[];
  branches: Branch[];
};

export default function StoresPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const canEdit = canManage(auth?.user.role);
  const canCreateStore = canDeleteOwnerOnly(auth?.user.role);
  const loadStores = useCallback(async (token: string): Promise<StoresPayload> => {
    const [stores, branches] = await Promise.all([api.stores(token), api.branches(token)]);
    return { stores, branches };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadStores, "dashboard:stores");
  const stores = data?.stores ?? [];
  const branches = data?.branches ?? [];

  return (
    <DashboardShell
      title={t("stores")}
      description={t("storesDescription")}
      action={canEdit ? <PageAction><Plus size={16} /> {t("addBranch")}</PageAction> : null}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("stores")} value={String(stores.length)} change={canCreateStore ? t("adminOnly") : t("readOnly")} tone="blue" />
        <StatCard label={t("branch")} value={String(activeBranchCount(stores, branches))} change={t("active")} tone="emerald" />
        <StatCard label={t("management")} value={canEdit ? t("active") : t("readOnly")} change={auth?.user.role ?? "STAFF"} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title={t("branchDirectory")} aside={<MapPin size={16} className="text-slate-400" />}>
          <ResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={!branches.length}
            emptyTitle={t("empty")}
            emptyDescription={t("emptyDescription")}
            forbiddenTitle={t("forbidden")}
            forbiddenDescription={t("forbiddenDescription")}
            errorTitle={t("requestFailed")}
            retryLabel={t("retry")}
            onRetry={reload}
          >
            <DataTable
              columns={[t("branch"), t("code"), t("stores"), t("city"), t("status")]}
              rows={branches.map((branch) => [
                <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">{branch.name}</span>,
                branch.code ?? "-",
                branch.store?.name ?? "-",
                branch.address ?? "-",
                canEdit ? t("management") : t("readOnly"),
              ])}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("storeProfile")} aside={<Building2 size={16} className="text-slate-400" />}>
            <div className="space-y-4">
              <Field label={t("stores")} placeholder="Downtown Market" />
              <Field label={t("code")} placeholder="DTM" />
              <Field label={t("branch")} placeholder="Central Market" />
              <Field label={t("address")} placeholder="12 Market Street" />
              <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{t("saveLocation")}</button>
            </div>
          </Section>
        ) : (
          <Section title={t("storeProfile")}>
            <EmptyState title={t("readOnly")} description={t("forbiddenDescription")} />
          </Section>
        )}
      </div>
    </DashboardShell>
  );
}
