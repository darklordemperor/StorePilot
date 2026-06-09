import { Plus, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, DataTable, EmptyState, Field, PageAction, Section } from "@/components/dashboard-ui";
import { products } from "@/lib/dashboard-data";

export default function ProductsPage() {
  return (
    <DashboardShell
      title="Products"
      description="Manage catalog items, pricing, categories, and selling status."
      action={<PageAction><Plus size={16} /> Add product</PageAction>}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Section title="Product catalog" aside={<Search size={16} className="text-slate-400" />}>
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

        <Section title="Product details">
          <div className="space-y-4">
            <Field label="Product name" placeholder="Cold Brew Coffee" />
            <Field label="SKU" placeholder="CB-001" />
            <Field label="Category" placeholder="Beverages" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price" placeholder="4.50" />
              <Field label="Cost" placeholder="2.10" />
            </div>
            <button className="h-10 w-full rounded-md bg-slate-950 text-sm font-semibold text-white">Save product</button>
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Archived products">
          <EmptyState
            title="No archived products"
            description="Inactive products will be listed here so they can be reviewed or restored without cluttering the active catalog."
          />
        </Section>
      </div>
    </DashboardShell>
  );
}
