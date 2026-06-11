"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSkeleton } from "./dashboard-skeleton";
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
    return <DashboardSkeleton />;
  }

  return children;
}
