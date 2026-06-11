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
import { api } from "@/lib/api";
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
  refresh: () => Promise<void>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const auth = useSyncExternalStore(
    subscribeToAuthStore,
    readStoredAuth,
    () => null,
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await api.login(input);
    persistAuth(response);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await api.register(input);
    persistAuth(response);
  }, []);

  const refresh = useCallback(async () => {
    const current = readStoredAuth();

    if (!current) {
      window.localStorage.removeItem(STORAGE_KEY);
      emitAuthChange();
      return;
    }

    const response = await api.refresh(current.refreshToken);
    persistAuth(response);
  }, []);

  const logout = useCallback(async () => {
    const current = readStoredAuth();

    if (current) {
      await api.logout(current.refreshToken).catch(() => undefined);
    }

    window.localStorage.removeItem(STORAGE_KEY);
    emitAuthChange();
  }, []);

  const value = useMemo(
    () => ({
      auth: isHydrated ? auth : null,
      isLoading: !isHydrated,
      login,
      register,
      logout,
      refresh,
    }),
    [auth, isHydrated, login, register, logout, refresh],
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
