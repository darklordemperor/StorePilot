"use client";

import { Building2, MapPin, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ApiError } from "@/lib/api";
import { DataTable, EmptyState, PageAction, Section, StatCard } from "@/components/dashboard-ui";
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
  const canDelete = canDeleteOwnerOnly(auth?.user.role);
  const loadStores = useCallback(async (token: string): Promise<StoresPayload> => {
    const [stores, branches] = await Promise.all([api.stores(token), api.branches(token)]);
    return { stores, branches };
  }, []);
  const { data, error, isLoading, reload } = useApiResource(loadStores, "dashboard:stores");
  const stores = data?.stores ?? [];
  const branches = data?.branches ?? [];
  const [form, setForm] = useState({ name: "", code: "", address: "" });
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function createBranch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.accessToken || !stores[0]) {
      setActionError(t("requestFailed"));
      return;
    }

    setActionError("");
    setIsSaving(true);

    try {
      await api.createBranch(auth.accessToken, {
        name: form.name,
        code: form.code || undefined,
        address: form.address || undefined,
        storeId: stores[0].id,
      });
      setForm({ name: "", code: "", address: "" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBranch(id: string) {
    if (!auth?.accessToken) return;
    try {
      await api.deleteBranch(auth.accessToken, id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

  return (
    <DashboardShell
      title={t("stores")}
      description={t("storesDescription")}
      action={canEdit ? <PageAction><Plus size={16} /> {t("addBranch")}</PageAction> : null}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("stores")} value={String(stores.length)} change={canCreateStore ? t("management") : t("readOnly")} tone="blue" />
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
              columns={[t("branch"), t("code"), t("stores"), t("address"), canDelete ? t("actions") : t("status")]}
              rows={branches.map((branch) => [
                <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">{branch.name}</span>,
                branch.code ?? "-",
                branch.store?.name ?? "-",
                branch.address ?? "-",
                canDelete ? (
                  <button key="delete" onClick={() => deleteBranch(branch.id)} title={t("delete")} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-500">
                    <Trash2 size={14} /> {t("delete")}
                  </button>
                ) : canEdit ? t("management") : t("readOnly"),
              ])}
            />
          </ResourceState>
        </Section>

        {canEdit ? (
          <Section title={t("storeProfile")} aside={<Building2 size={16} className="text-slate-400" />}>
            <form onSubmit={createBranch} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("branch")}<input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("code")}<input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("address")}<input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" /></label>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
              <button disabled={isSaving || !stores.length} className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">{isSaving ? t("loading") : t("saveLocation")}</button>
            </form>
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
