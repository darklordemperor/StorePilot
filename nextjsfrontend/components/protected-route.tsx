"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { auth, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !auth) {
      router.replace("/login");
    }
  }, [auth, isLoading, router]);

  if (isLoading || !auth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-300">
        Loading...
      </main>
    );
  }

  return children;
}
