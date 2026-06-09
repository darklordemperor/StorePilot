import { Plus, Shuffle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, Field, PageAction, Section } from "@/components/dashboard-ui";
import { movements } from "@/lib/dashboard-data";

export default function StockMovementsPage() {
  return (
    <DashboardShell
      title="Stock movements"
      description="Audit incoming, outgoing, sale, return, and adjustment activity."
      action={<PageAction><Plus size={16} /> New movement</PageAction>}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title="Movement ledger" aside={<Shuffle size={16} className="text-slate-400" />}>
          <DataTable
            columns={["Type", "Product", "Branch", "Qty", "User", "Time"]}
            rows={movements.map((movement) => [
              <Badge key="type" tone={movement.type === "IN" || movement.type === "RETURN" ? "emerald" : movement.type === "ADJUSTMENT" ? "amber" : "rose"}>{movement.type}</Badge>,
              movement.product,
              movement.branch,
              <span key="qty" className={movement.qty.startsWith("+") ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>{movement.qty}</span>,
              movement.user,
              movement.time,
            ])}
          />
        </Section>

        <Section title="Record movement">
          <div className="space-y-4">
            <Field label="Product" placeholder="Cold Brew Coffee" />
            <Field label="Branch" placeholder="Central Market" />
            <Field label="Type" placeholder="IN, OUT, ADJUSTMENT" />
            <Field label="Quantity" placeholder="12" />
            <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white">Record movement</button>
          </div>
        </Section>
      </div>
    </DashboardShell>
  );
}
