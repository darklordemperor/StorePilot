import { Activity, ArrowUpRight, PackageCheck, ShoppingCart } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, PageAction, Section, StatCard } from "@/components/dashboard-ui";
import { activity, metrics, orders, products } from "@/lib/dashboard-data";

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard overview"
      description="Today’s operating snapshot across stores, inventory, and orders."
      action={<PageAction>New sale</PageAction>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            tone={metric.tone as "emerald" | "blue" | "amber" | "rose"}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Section title="Recent orders" aside={<Badge tone="blue">Live</Badge>}>
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

        <Section title="Operations feed">
          <div className="space-y-4">
            {activity.map((item, index) => (
              <div key={item} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  {index === 0 ? <ShoppingCart size={16} /> : index === 1 ? <PackageCheck size={16} /> : <Activity size={16} />}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{item}</div>
                  <div className="mt-1 text-xs text-slate-500">{index + 1}h ago</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Products needing attention" aside={<ArrowUpRight size={16} className="text-slate-400" />}>
          <DataTable
            columns={["SKU", "Product", "Category", "Stock", "Price", "Status"]}
            rows={products.map((product) => [
              product.sku,
              <span key="name" className="font-semibold text-slate-950">{product.name}</span>,
              product.category,
              product.stock,
              product.price,
              <Badge key="status" tone={product.status === "Low" ? "amber" : "emerald"}>{product.status}</Badge>,
            ])}
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
