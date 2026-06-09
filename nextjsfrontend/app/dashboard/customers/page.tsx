import { Plus, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, EmptyState, Field, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { customers } from "@/lib/dashboard-data";

export default function CustomersPage() {
  return (
    <DashboardShell
      title="Customers"
      description="Manage customer profiles, contact details, and account value."
      action={<PageAction><Plus size={16} /> Add customer</PageAction>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Customers" value="842" change="+34 this month" tone="emerald" />
        <StatCard label="Repeat buyers" value="61%" change="+5.8%" tone="blue" />
        <StatCard label="Top account" value="Sora" change="$12.9k spend" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title="Customer list" aside={<Users size={16} className="text-slate-400" />}>
          <DataTable
            columns={["Customer", "Email", "Phone", "Lifetime spend"]}
            rows={customers.map((customer) => [
              <span key="name" className="font-semibold text-slate-950">{customer.name}</span>,
              customer.email,
              customer.phone,
              customer.spend,
            ])}
          />
        </Section>

        <Section title="Customer profile">
          <div className="space-y-4">
            <Field label="Name" placeholder="Lina Wholesale" />
            <Field label="Email" placeholder="orders@lina.example" />
            <Field label="Phone" placeholder="+66 80 222 1400" />
            <Field label="Address" placeholder="Business address" />
            <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white">Save customer</button>
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Customer segments">
          <EmptyState
            title="No saved segments"
            description="Create customer segments from order history, branch activity, or lifetime spend to support targeted sales workflows."
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
