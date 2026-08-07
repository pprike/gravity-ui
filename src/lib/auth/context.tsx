"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  activateInvite as activateInviteApi,
  createDemoSession,
  login as loginApi,
  logout as logoutApi,
} from "@/lib/api/auth";
import {
  clearSession,
  getStoredSession,
  isSessionExpired,
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredSession();
    if (stored && !isSessionExpired(stored)) {
      setSession(stored);
    } else if (stored) {
      clearSession();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const nextSession = await loginApi(request);
    setSession(nextSession);
    return getDashboardPath(nextSession.user.roles);
  }, []);

  const activateInvite = useCallback(async (request: ActivateInviteRequest) => {
    const nextSession = await activateInviteApi(request);
    setSession(nextSession);
    return getDashboardPath(nextSession.user.roles);
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    const nextSession = createDemoSession(role);
    setSession(nextSession);
    return getDashboardPath(nextSession.user.roles);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setSession(null);
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
