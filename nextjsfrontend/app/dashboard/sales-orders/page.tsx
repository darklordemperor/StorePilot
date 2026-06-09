import { Plus, ReceiptText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, Field, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { orders } from "@/lib/dashboard-data";

export default function SalesOrdersPage() {
  return (
    <DashboardShell
      title="Sales orders"
      description="Create and review orders, line items, customers, and fulfillment status."
      action={<PageAction><Plus size={16} /> New order</PageAction>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Today sales" value="$6,840" change="+12.4%" tone="emerald" />
        <StatCard label="Average order" value="$53.20" change="+3.1%" tone="blue" />
        <StatCard label="Draft orders" value="9" change="Awaiting close" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title="Order queue" aside={<ReceiptText size={16} className="text-slate-400" />}>
          <DataTable
            columns={["Order", "Customer", "Branch", "Total", "Status"]}
            rows={orders.map((order) => [
              <span key="number" className="font-semibold text-slate-950">{order.number}</span>,
              order.customer,
              order.branch,
              order.total,
              <Badge key="status" tone={order.status === "Completed" ? "emerald" : "amber"}>{order.status}</Badge>,
            ])}
          />
        </Section>

        <Section title="Create order">
          <div className="space-y-4">
            <Field label="Order number" placeholder="SO-1049" />
            <Field label="Customer" placeholder="Sora Hotel" />
            <Field label="Branch" placeholder="Central Market" />
            <Field label="Product" placeholder="Cold Brew Coffee" />
            <Field label="Quantity" placeholder="6" />
            <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white">Create order</button>
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Refunds">
          <EmptyState
            title="No open refund reviews"
            description="Refunded and disputed orders will appear here for owner or manager approval."
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
