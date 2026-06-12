"use client";

import { ShieldCheck, UserCog } from "lucide-react";
import { useCallback, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, Field, PageAction, Section } from "@/components/dashboard-ui";
import { ResourceState } from "@/components/resource-state";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { api, ApiError } from "@/lib/api";
import type { AuthUser, Role } from "@/lib/auth";
import { useApiResource } from "@/lib/use-api-resource";

export default function SettingsPage() {
  const { auth } = useAuth();
  const { t } = usePreferences();
  const loadUsers = useCallback((token: string) => api.users(token), []);
  const { data, error, isLoading, reload } = useApiResource<AuthUser[]>(loadUsers, "dashboard:settings:users");
  const users = data ?? [];
  const [actionError, setActionError] = useState("");

  async function updateUser(id: string, input: { role?: Role; isBanned?: boolean }) {
    if (!auth?.accessToken) return;
    setActionError("");
    try {
      await api.updateUser(auth.accessToken, id, input);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

  async function deleteUser(id: string) {
    if (!auth?.accessToken) return;
    setActionError("");
    try {
      await api.deleteUser(auth.accessToken, id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("requestFailed"));
    }
  }

  return (
    <DashboardShell
      title={t("settings")}
      description={t("settingsDescription")}
      action={<PageAction>{t("saveChanges")}</PageAction>}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title={t("businessProfile")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("businessName")} placeholder="StorePilot Retail Group" />
            <Field label={t("defaultCurrency")} placeholder="USD" />
            <Field label={t("taxRegistration")} placeholder="TAX-224401" />
            <Field label={t("timezone")} placeholder="Asia/Bangkok" />
          </div>
        </Section>

        <Section title={t("accessRoles")} aside={<ShieldCheck size={16} className="text-slate-400" />}>
          <div className="space-y-3">
            {[
              ["OWNER", t("fullControl")],
              ["MANAGER", t("manageOperations")],
              ["STAFF", t("staffAccess")],
            ].map(([role, copy]) => (
              <div key={role} className="flex items-start justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <Badge tone={role === "OWNER" ? "rose" : role === "MANAGER" ? "blue" : "emerald"}>{role}</Badge>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{copy}</div>
                </div>
                <UserCog size={17} className="text-slate-400" />
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <Section title={t("userAdmin")}>
          <ResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={!users.length}
            emptyTitle={t("empty")}
            emptyDescription={t("emptyDescription")}
            forbiddenTitle={t("forbidden")}
            forbiddenDescription={t("forbiddenDescription")}
            errorTitle={t("requestFailed")}
            retryLabel={t("retry")}
            onRetry={reload}
          >
            {actionError ? <p className="mb-3 text-sm text-rose-600">{actionError}</p> : null}
            <DataTable
              columns={[t("name"), t("email"), t("role"), t("status"), t("management")]}
              rows={users.map((user) => [
                <span key="name" className="font-semibold text-slate-950 dark:text-slate-50">{user.name ?? "-"}</span>,
                user.email,
                <Badge key="role" tone={user.role === "OWNER" ? "rose" : user.role === "MANAGER" ? "blue" : "emerald"}>{user.role}</Badge>,
                <Badge key="status" tone={user.isBanned ? "rose" : "emerald"}>{user.isBanned ? "BANNED" : t("active")}</Badge>,
                <div key="actions" className="flex flex-wrap gap-2">
                  {user.role !== "OWNER" ? (
                    <button onClick={() => updateUser(user.id, { role: user.role === "MANAGER" ? "STAFF" : "MANAGER" })} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-slate-800">
                      {user.role === "MANAGER" ? "Demote" : "Promote"}
                    </button>
                  ) : null}
                  {user.role !== "OWNER" ? (
                    <button onClick={() => updateUser(user.id, { isBanned: !user.isBanned })} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-slate-800">
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  ) : null}
                  {user.role !== "OWNER" ? (
                    <button onClick={() => deleteUser(user.id)} className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 dark:border-rose-900">
                      Delete
                    </button>
                  ) : null}
                </div>,
              ])}
            />
          </ResourceState>
        </Section>
      </div>
    </DashboardShell>
  );
}
