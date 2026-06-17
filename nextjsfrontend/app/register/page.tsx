"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppChromeControls } from "@/components/app-chrome-controls";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { ApiError } from "@/lib/api";
import type { Role } from "@/lib/auth";

const roles: Role[] = ["OWNER", "MANAGER", "STAFF"];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = usePreferences();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register({ name, email, password, role });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("requestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f7f8fb] text-slate-950 lg:grid-cols-[1fr_520px] dark:bg-[#080b12] dark:text-slate-50">
      <AppChromeControls className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6" />
      <section className="hidden content-center overflow-hidden bg-slate-950 px-12 text-white lg:grid dark:bg-slate-900">
        <div className="max-w-xl">
          <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950 shadow-sm">
            <BarChart3 size={20} />
          </div>
          <h1 className="text-5xl font-semibold leading-tight">{t("registerHeroTitle")}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{t("registerHeroDescription")}</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {roles.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">{item}</div>
                <div className="mt-1 text-xs font-medium text-slate-400">Role access</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border border-slate-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:p-8 dark:border-slate-800/80 dark:bg-slate-950">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <BarChart3 size={18} />
            </span>
            StorePilot
          </Link>
          <h2 className="mt-8 text-3xl font-semibold">{t("register")}</h2>

          <label className="mt-8 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("name")}
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("email")}
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("password")}
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("role")}
            <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
              {roles.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</p> : null}

          <button disabled={isSubmitting} className="mt-7 h-11 w-full rounded-lg bg-slate-950 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
            {isSubmitting ? t("creatingAccount") : t("createAccount")}
          </button>

          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            {t("alreadyRegistered")} <Link href="/login" className="font-semibold text-slate-950 dark:text-slate-50">{t("login")}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
