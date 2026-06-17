export function PageAction({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
      {children}
    </button>
  );
}

export function Section({
  title,
  children,
  aside,
}: {
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)] dark:border-slate-800/80 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  change,
  tone = "slate",
}: {
  label: string;
  value: string;
  change: string;
  tone?: "emerald" | "blue" | "amber" | "rose" | "slate";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
    blue: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
    slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  };

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,23,42,0.07)] dark:border-slate-800/80 dark:bg-slate-950">
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{value}</div>
      <div className={`mt-4 inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${tones[tone]}`}>
        {change}
      </div>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800/80">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold tracking-normal">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {rows.map((row, index) => (
            <tr key={index} className="transition hover:bg-teal-50/60 dark:hover:bg-slate-900">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "emerald" | "blue" | "amber" | "rose" | "slate";
}) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
    blue: "bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900",
    amber: "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
    rose: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
    slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800",
  };

  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Field({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      <input
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
      />
    </label>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</div>
      <div className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="grid grid-cols-5 gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  actionLabel,
  onRetry,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {actionLabel}
          </button>
        ) : null
      }
    />
  );
}
