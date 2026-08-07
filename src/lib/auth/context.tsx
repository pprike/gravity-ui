"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  activateInvite as activateInviteApi,
  createDemoSession,
  login as loginApi,
  logout as logoutApi,
} from "@/lib/api/auth";
import {
  readAuthSession,
  subscribeAuthSession,
} from "@/lib/auth/storage";
import { getDashboardPath } from "@/lib/navigation/config";
import type {
  ActivateInviteRequest,
  AuthSession,
  AuthUser,
  LoginRequest,
  UserRole,
} from "@/lib/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<string>;
  activateInvite: (request: ActivateInviteRequest) => Promise<string>;
  loginAsDemo: (role: UserRole) => string;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeToClientMount(listener: () => void): () => void {
  listener();
  return () => {};
}

function getClientMounted(): boolean {
  return true;
}

function getServerMounted(): boolean {
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(
    subscribeAuthSession,
    readAuthSession,
    () => null,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToClientMount,
    getClientMounted,
    getServerMounted,
  );
  const isLoading = !isHydrated;

  const login = useCallback(async (request: LoginRequest) => {
    const nextSession = await loginApi(request);
    return getDashboardPath(nextSession.user.roles);
  }, []);

  const activateInvite = useCallback(async (request: ActivateInviteRequest) => {
    const nextSession = await activateInviteApi(request);
    return getDashboardPath(nextSession.user.roles);
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    const nextSession = createDemoSession(role);
    return getDashboardPath(nextSession.user.roles);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      isAuthenticated: Boolean(session),
      login,
      activateInvite,
      loginAsDemo,
      logout,
    }),
    [session, isLoading, login, activateInvite, loginAsDemo, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
