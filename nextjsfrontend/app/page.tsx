"use client";

import { BarChart3, Boxes, Building2, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { auth, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
            <BarChart3 size={18} />
          </span>
          StorePilot
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {auth ? (
            <>
              <Link href="/dashboard" className="rounded-md border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                Dashboard
              </Link>
              <button onClick={logout} className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-6xl content-center gap-8 px-6 py-12 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Store operations platform
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-950 md:text-7xl">
            Run every branch from one clean dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Products, inventory, movements, customers, orders, and role-based access in a focused business console.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href={auth ? "/dashboard" : "/register"} className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Open workspace
            </Link>
            <Link href="/login" className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              Sign in
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xl">
          <div className="grid gap-3">
            {[
              ["Catalog", "284 active SKUs", PackageIcon],
              ["Branches", "6 locations reporting", Building2],
              ["Inventory", "98.1% count accuracy", Boxes],
              ["Orders", "$48.2k monthly revenue", ReceiptText],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="flex items-center gap-4 rounded-md border border-slate-200 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-950">{label}</div>
                  <div className="text-sm text-slate-500">{value}</div>
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
