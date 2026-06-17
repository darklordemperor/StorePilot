"use client";

import {
  BarChart3,
  Boxes,
  Building2,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  Shuffle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppChromeControls } from "@/components/app-chrome-controls";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { canAdminUsers } from "@/lib/roles";
import type { Role } from "@/lib/auth";
import type { TranslationKey } from "@/lib/i18n";

type NavItem = {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  roles?: Role[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "overview", icon: LayoutDashboard },
  { href: "/dashboard/products", labelKey: "products", icon: Package },
  { href: "/dashboard/stores", labelKey: "stores", icon: Building2 },
  { href: "/dashboard/inventory", labelKey: "inventory", icon: Boxes },
  { href: "/dashboard/stock-movements", labelKey: "stockMovements", icon: Shuffle },
  { href: "/dashboard/customers", labelKey: "customers", icon: Users },
  { href: "/dashboard/sales-orders", labelKey: "salesOrders", icon: ReceiptText },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings, roles: ["OWNER"] },
];

export function DashboardShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { auth, logout } = useAuth();
  const { t } = usePreferences();
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (auth?.user.role && item.roles.includes(auth.user.role)),
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f7f8fb] text-slate-950 dark:bg-[#080b12] dark:text-slate-50">
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200/80 bg-white/95 shadow-[12px_0_40px_rgba(15,23,42,0.04)] backdrop-blur lg:flex lg:flex-col dark:border-slate-800/80 dark:bg-slate-950/95">
          <div className="flex min-h-24 items-end gap-3 border-b border-slate-200/80 px-6 pb-5 dark:border-slate-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-950 dark:text-slate-50">StorePilot</div>
              <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t("operationsConsole")}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                      active
                        ? "bg-white/10 text-white dark:bg-slate-950/10 dark:text-slate-950"
                        : "bg-slate-100 text-slate-500 group-hover:text-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  {t(item.labelKey as TranslationKey)}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200/80 p-4 dark:border-slate-800/80">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                  {(auth?.user.name ?? "S").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                    {auth?.user.name ?? "StorePilot user"}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{auth?.user.email}</div>
                </div>
              </div>
              <div className="mt-3 inline-flex rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {auth?.user.role}
              </div>
              {!canAdminUsers(auth?.user.role) ? (
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {auth?.user.role === "STAFF" ? t("readOnly") : t("management")}
                </div>
              ) : null}
            </div>
            <button
              onClick={logout}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <LogOut size={16} />
              {t("signOut")}
            </button>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-4 sm:px-5 lg:px-8">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-normal text-slate-950 sm:text-2xl dark:text-slate-50">{title}</h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {action}
                <AppChromeControls />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-5 lg:hidden">
              {visibleNavItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                      active
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={15} />
                    {t(item.labelKey as TranslationKey)}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="px-4 py-6 sm:px-5 lg:px-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
