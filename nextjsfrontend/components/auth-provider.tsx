"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse, AuthState, LoginInput, RegisterInput } from "@/lib/auth";

const STORAGE_KEY = "storepilot.auth";
let cachedAuthText: string | null = null;
let cachedAuthState: AuthState | null = null;

type AuthContextValue = {
  auth: AuthState | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthState | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function emitAuthChange() {
  window.dispatchEvent(new Event("storepilot-auth-change"));
}

function subscribeToAuthStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("storepilot-auth-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("storepilot-auth-change", onStoreChange);
  };
}

function readStoredAuth(): AuthState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === cachedAuthText) {
    return cachedAuthState;
  }

  cachedAuthText = stored;

  if (!stored) {
    cachedAuthState = null;
    return null;
  }

  try {
    cachedAuthState = JSON.parse(stored) as AuthState;
    return cachedAuthState;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    cachedAuthText = null;
    cachedAuthState = null;
    return null;
  }
}

function persistAuth(authResponse: AuthResponse) {
  const state: AuthState = {
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
    user: authResponse.user,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emitAuthChange();
  return state;
}

function clearStoredAuth() {
  window.localStorage.removeItem(STORAGE_KEY);
  cachedAuthText = null;
  cachedAuthState = null;
  emitAuthChange();
}

function isJwtExpired(token: string) {
  try {
    const payload = JSON.parse(window.atob(token.split(".")[1])) as {
      exp?: number;
    };

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const auth = useSyncExternalStore(
    subscribeToAuthStore,
    readStoredAuth,
    () => null,
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const current = readStoredAuth();

    if (!current) {
      setIsSessionReady(true);
      return;
    }

    const existingAuth = current;
    let cancelled = false;
    setIsSessionReady(false);

    async function validateSession() {
      try {
        if (isJwtExpired(existingAuth.accessToken)) {
          const refreshed = await api.refresh(existingAuth.refreshToken);
          if (!cancelled) {
            persistAuth(refreshed);
          }
          return;
        }

        await api.me(existingAuth.accessToken);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          try {
            const refreshed = await api.refresh(existingAuth.refreshToken);
            if (!cancelled) {
              persistAuth(refreshed);
            }
          } catch {
            if (!cancelled) {
              clearStoredAuth();
            }
          }
          return;
        }
      } finally {
        if (!cancelled) {
          setIsSessionReady(true);
        }
      }
    }

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [isHydrated]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await api.login(input);
    persistAuth(response);
    setIsSessionReady(true);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await api.register(input);
    persistAuth(response);
    setIsSessionReady(true);
  }, []);

  const refresh = useCallback(async () => {
    const current = readStoredAuth();

    if (!current) {
      clearStoredAuth();
      setIsSessionReady(true);
      return null;
    }

    const response = await api.refresh(current.refreshToken);
    const nextAuth = persistAuth(response);
    setIsSessionReady(true);
    return nextAuth;
  }, []);

  const logout = useCallback(async () => {
    const current = readStoredAuth();

    if (current) {
      await api.logout(current.refreshToken).catch(() => undefined);
    }

    clearStoredAuth();
    setIsSessionReady(true);
  }, []);

  const value = useMemo(
    () => ({
      auth: isHydrated && isSessionReady ? auth : null,
      isLoading: !isHydrated || !isSessionReady,
      login,
      register,
      logout,
      refresh,
    }),
    [auth, isHydrated, isSessionReady, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
