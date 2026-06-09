import { Boxes, Download } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { inventory } from "@/lib/dashboard-data";

export default function InventoryPage() {
  return (
    <DashboardShell
      title="Inventory"
      description="Monitor stock on hand by product and branch."
      action={<PageAction><Download size={16} /> Export</PageAction>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Inventory value" value="$21,408" change="+4.2%" tone="emerald" />
        <StatCard label="Reorder alerts" value="18" change="Across 4 branches" tone="amber" />
        <StatCard label="Stock accuracy" value="98.1%" change="Last count" tone="blue" />
      </div>

      <div className="mt-6">
        <Section title="Branch stock" aside={<Boxes size={16} className="text-slate-400" />}>
          <DataTable
            columns={["Product", "Branch", "On hand", "Reorder level", "Value", "Status"]}
            rows={inventory.map((item) => [
              <span key="product" className="font-semibold text-slate-950">{item.product}</span>,
              item.branch,
              item.onHand,
              item.reorder,
              item.value,
              <Badge key="status" tone={item.onHand <= item.reorder ? "amber" : "emerald"}>
                {item.onHand <= item.reorder ? "Reorder" : "Healthy"}
              </Badge>,
            ])}
          />
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Transfer queue">
          <EmptyState
            title="No pending stock transfers"
            description="Branch-to-branch transfer requests will appear here once managers start moving inventory between locations."
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
