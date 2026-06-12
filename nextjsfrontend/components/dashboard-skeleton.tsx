import { BarChart3 } from "lucide-react";
import { AppChromeControls } from "./app-chrome-controls";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950">
        <div className="flex min-h-24 items-end gap-3 border-b border-slate-200 px-6 pb-5 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="text-base font-semibold">StorePilot</div>
            <SkeletonBlock className="mt-2 h-3 w-32" />
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-5">
          {[0, 1, 2, 3, 4, 5, 6].map((item) => (
            <SkeletonBlock key={item} className="h-10 w-full" />
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-900">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-3 h-3 w-44" />
            <SkeletonBlock className="mt-4 h-6 w-20" />
          </div>
          <SkeletonBlock className="mt-3 h-10 w-full" />
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <div className="min-w-0">
              <SkeletonBlock className="h-7 w-56" />
              <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SkeletonBlock className="h-10 w-24" />
              <AppChromeControls />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto px-5 pb-3 lg:hidden">
            {[0, 1, 2, 3].map((item) => (
              <SkeletonBlock key={item} className="h-9 w-24 shrink-0" />
            ))}
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">
          <span className="sr-only">Loading dashboard</span>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-4 h-8 w-20" />
                <SkeletonBlock className="mt-5 h-6 w-28" />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <SkeletonBlock className="h-5 w-40" />
            </div>
            <div className="space-y-3 p-5">
              {[0, 1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="grid grid-cols-5 gap-3 rounded-md border border-slate-200 p-4 dark:border-slate-800"
                >
                  <SkeletonBlock className="h-4" />
                  <SkeletonBlock className="h-4" />
                  <SkeletonBlock className="h-4" />
                  <SkeletonBlock className="h-4" />
                  <SkeletonBlock className="h-4" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
