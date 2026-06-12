"use client";

import { BarChart3, Boxes, Building2, ReceiptText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { AppChromeControls } from "@/components/app-chrome-controls";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";

export default function Home() {
  const { auth, isLoading, logout } = useAuth();
  const { t } = usePreferences();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
            <BarChart3 size={18} />
          </span>
          StorePilot
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <AppChromeControls />
          {isLoading ? null : auth ? (
            <>
              <Link href="/dashboard" className="rounded-md border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {t("dashboard")}
              </Link>
              <button onClick={logout} className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
                {t("signOut")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {t("login")}
              </Link>
              <Link href="/register" className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-6xl content-center gap-8 px-6 py-12 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {t("homeEyebrow")}
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-950 md:text-7xl dark:text-slate-50">
            {t("homeTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">{t("homeDescription")}</p>
          <div className="mt-8 flex gap-3">
            <Link href={auth ? "/dashboard" : "/register"} className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              {t("openWorkspace")}
            </Link>
            <Link href="/login" className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {t("signIn")}
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div className="grid gap-3">
            {([
              [t("products"), "284 active SKUs", PackageIcon],
              [t("branch"), "6 locations reporting", Building2],
              [t("inventory"), "98.1% count accuracy", Boxes],
              [t("salesOrders"), "$48.2k monthly revenue", ReceiptText],
            ] as Array<[string, string, LucideIcon | typeof PackageIcon]>).map(([label, value, Icon]) => (
              <div key={label as string} className="flex items-center gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-950 dark:text-slate-50">{label}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PackageIcon({ size }: { size: number }) {
  return <Boxes size={size} />;
}
