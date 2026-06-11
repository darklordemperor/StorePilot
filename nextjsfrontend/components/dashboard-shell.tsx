"use client";

import {
  BarChart3,
  Boxes,
  Building2,
  Globe2,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  ReceiptText,
  Settings,
  Shuffle,
  Sun,
  SunMoon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { usePreferences, type ThemeMode } from "@/components/app-preferences-provider";
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
  const { t, language, setLanguage, theme, setTheme } = usePreferences();
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (auth?.user.role && item.roles.includes(auth.user.role)),
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950">
          <div className="flex min-h-24 items-end gap-3 border-b border-slate-200 px-6 pb-5 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="text-base font-semibold">StorePilot</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t("operationsConsole")}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                    active
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                  }`}
                >
                  <Icon size={17} />
                  {t(item.labelKey as TranslationKey)}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-900">
              <div className="text-sm font-semibold">{auth?.user.name ?? "StorePilot user"}</div>
              <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{auth?.user.email}</div>
              <div className="mt-3 inline-flex rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
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
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <LogOut size={16} />
              {t("signOut")}
            </button>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 lg:px-8">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">{title}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {action}
                <ThemeButton theme={theme} setTheme={setTheme} label={t("theme")} />
                <LanguageButton language={language} setLanguage={setLanguage} label={t("language")} />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-5 pb-3 lg:hidden">
              {visibleNavItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {t(item.labelKey as TranslationKey)}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="px-5 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ThemeButton({
  theme,
  setTheme,
  label,
}: {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  label: string;
}) {
  const nextTheme: Record<ThemeMode, ThemeMode> = {
    light: "system",
    dark: "light",
    system: "dark",
  };
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme[theme])}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
    >
      <Icon size={17} />
    </button>
  );
}

function LanguageButton({
  language,
  setLanguage,
  label,
}: {
  language: "th" | "en";
  setLanguage: (language: "th" | "en") => void;
  label: string;
}) {
  const nextLanguage = language === "th" ? "en" : "th";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={label}
      title={`${label}: ${language.toUpperCase()}`}
      className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
    >
      <Globe2 size={16} />
      {language.toUpperCase()}
    </button>
  );
}
