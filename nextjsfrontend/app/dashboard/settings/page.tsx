import { ShieldCheck, UserCog } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, Field, PageAction, Section } from "@/components/dashboard-ui";

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Configure business identity, access roles, and operational defaults."
      action={<PageAction>Save changes</PageAction>}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Business profile">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business name" placeholder="StorePilot Retail Group" />
            <Field label="Default currency" placeholder="USD" />
            <Field label="Tax registration" placeholder="TAX-224401" />
            <Field label="Timezone" placeholder="Asia/Bangkok" />
          </div>
        </Section>

        <Section title="Access roles" aside={<ShieldCheck size={16} className="text-slate-400" />}>
          <div className="space-y-3">
            {[
              ["OWNER", "Full control over stores, users, finance, and settings"],
              ["MANAGER", "Manage catalog, stock, customers, and orders"],
              ["STAFF", "Create sales and view assigned branch data"],
            ].map(([role, copy]) => (
              <div key={role} className="flex items-start justify-between gap-4 rounded-md border border-slate-200 p-4">
                <div>
                  <Badge tone={role === "OWNER" ? "rose" : role === "MANAGER" ? "blue" : "emerald"}>{role}</Badge>
                  <div className="mt-2 text-sm text-slate-600">{copy}</div>
                </div>
                <UserCog size={17} className="text-slate-400" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </DashboardShell>
  );
}
