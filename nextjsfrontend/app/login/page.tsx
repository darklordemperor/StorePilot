"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { usePreferences } from "@/components/app-preferences-provider";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = usePreferences();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("requestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-950 lg:grid-cols-[1fr_480px] dark:bg-slate-950 dark:text-slate-50">
      <section className="hidden content-center bg-slate-950 px-12 text-white lg:grid dark:bg-slate-900">
        <div className="max-w-xl">
          <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-md bg-white text-slate-950">
            <BarChart3 size={20} />
          </div>
          <h1 className="text-5xl font-semibold leading-tight">{t("loginHeroTitle")}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{t("loginHeroDescription")}</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <BarChart3 size={18} />
            </span>
            StorePilot
          </Link>
          <h2 className="mt-8 text-3xl font-semibold">{t("login")}</h2>

          <label className="mt-8 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("email")}
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-slate-950 outline-none focus:border-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("password")}
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-slate-950 outline-none focus:border-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50" />
          </label>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button disabled={isSubmitting} className="mt-7 h-11 w-full rounded-md bg-slate-950 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? t("signingIn") : t("signIn")}
          </button>

          <p className="mt-5 text-sm text-slate-500">
            {t("needAccount")} <Link href="/register" className="font-semibold text-slate-950 dark:text-slate-50">{t("register")}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
