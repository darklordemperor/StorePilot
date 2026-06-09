import { Building2, MapPin, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, Field, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { branches } from "@/lib/dashboard-data";

export default function StoresPage() {
  return (
    <DashboardShell
      title="Stores and branches"
      description="Track business locations, managers, branch codes, and sales coverage."
      action={<PageAction><Plus size={16} /> Add branch</PageAction>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Stores" value="2" change="Active" tone="blue" />
        <StatCard label="Branches" value="6" change="3 reporting today" tone="emerald" />
        <StatCard label="Top branch" value="Central" change="$21.8k revenue" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title="Branch directory" aside={<MapPin size={16} className="text-slate-400" />}>
          <DataTable
            columns={["Branch", "Code", "City", "Manager", "Revenue"]}
            rows={branches.map((branch) => [
              <span key="name" className="font-semibold text-slate-950">{branch.name}</span>,
              branch.code,
              branch.city,
              branch.manager,
              branch.revenue,
            ])}
          />
        </Section>

        <Section title="Store profile" aside={<Building2 size={16} className="text-slate-400" />}>
          <div className="space-y-4">
            <Field label="Store name" placeholder="Downtown Market" />
            <Field label="Store code" placeholder="DTM" />
            <Field label="Branch name" placeholder="Central Market" />
            <Field label="Address" placeholder="12 Market Street" />
            <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white">Save location</button>
          </div>
        </Section>
      </div>
    </DashboardShell>
  );
}
