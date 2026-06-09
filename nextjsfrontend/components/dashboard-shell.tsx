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
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/stores", label: "Stores", icon: Building2 },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
  { href: "/dashboard/stock-movements", label: "Stock movements", icon: Shuffle },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/sales-orders", label: "Sales orders", icon: ReceiptText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="text-base font-semibold">StorePilot</div>
              <div className="text-xs text-slate-500">Operations console</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="rounded-md bg-slate-100 p-3">
              <div className="text-sm font-semibold">{auth?.user.name ?? "StorePilot user"}</div>
              <div className="mt-1 truncate text-xs text-slate-500">{auth?.user.email}</div>
              <div className="mt-3 inline-flex rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                {auth?.user.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 lg:px-8">
              <div>
                <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
              {action}
            </div>
            <div className="flex gap-2 overflow-x-auto px-5 pb-3 lg:hidden">
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.label}
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
