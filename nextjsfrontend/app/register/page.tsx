"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api";
import type { Role } from "@/lib/auth";

const roles: Role[] = ["OWNER", "MANAGER", "STAFF"];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
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
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="hidden content-center bg-slate-950 px-12 text-white lg:grid">
        <div className="max-w-xl">
          <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-md bg-white text-slate-950">
            <BarChart3 size={20} />
          </div>
          <h1 className="text-5xl font-semibold leading-tight">Create your StorePilot workspace.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Assign a role, connect stores, and start building an operating record.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 shadow-xl">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <BarChart3 size={18} />
            </span>
            StorePilot
          </Link>
          <h2 className="mt-8 text-3xl font-semibold">Register</h2>

          <label className="mt-8 block text-sm font-medium text-slate-700">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-slate-950 outline-none focus:border-slate-500" />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-slate-950 outline-none focus:border-slate-500" />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-slate-950 outline-none focus:border-slate-500" />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-slate-950 outline-none focus:border-slate-500">
              {roles.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button disabled={isSubmitting} className="mt-7 h-11 w-full rounded-md bg-slate-950 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-5 text-sm text-slate-500">
            Already registered? <Link href="/login" className="font-semibold text-slate-950">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
