"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "./api";

type ResourceState<T> = {
  data: T | null;
  error: ApiError | Error | null;
  isLoading: boolean;
  reload: () => void;
};

const resourceCache = new Map<string, unknown>();

export function useApiResource<T>(
  load: (accessToken: string) => Promise<T>,
  cacheKey?: string,
): ResourceState<T> {
  const { auth, refresh } = useAuth();
  const [data, setData] = useState<T | null>(() =>
    cacheKey && resourceCache.has(cacheKey)
      ? (resourceCache.get(cacheKey) as T)
      : null,
  );
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [isLoading, setIsLoading] = useState(
    !(cacheKey && resourceCache.has(cacheKey)),
  );
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    if (!auth?.accessToken) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(!cacheKey || !resourceCache.has(cacheKey));
    setError(null);

    load(auth.accessToken)
      .then((payload) => {
        if (!cancelled) {
          if (cacheKey) {
            resourceCache.set(cacheKey, payload);
          }
          setData(payload);
        }
      })
      .catch(async (err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          const refreshed = await refresh().catch(() => null);

          if (refreshed) {
            try {
              const payload = await load(refreshed.accessToken);

              if (!cancelled) {
                if (cacheKey) {
                  resourceCache.set(cacheKey, payload);
                }
                setData(payload);
                return;
              }
            } catch (retryErr) {
              if (!cancelled) {
                setError(
                  retryErr instanceof Error
                    ? retryErr
                    : new Error("Request failed"),
                );
              }
              return;
            }
          }
        }

        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Request failed"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth?.accessToken, cacheKey, load, refresh, version]);

  return { data, error, isLoading, reload };
}
