import { LoadingRows, Section, StatCard } from "@/components/dashboard-ui";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-950 lg:pl-80">
      <div className="h-8 w-64 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Loading" value="--" change="Syncing" tone="slate" />
        <StatCard label="Loading" value="--" change="Syncing" tone="slate" />
        <StatCard label="Loading" value="--" change="Syncing" tone="slate" />
        <StatCard label="Loading" value="--" change="Syncing" tone="slate" />
      </div>
      <div className="mt-6">
        <Section title="Loading records">
          <LoadingRows />
        </Section>
      </div>
    </div>
  );
}
