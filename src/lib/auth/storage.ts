import type { AuthSession } from "@/lib/types/auth";

const SESSION_KEY = "gravity_auth_session";
const ACCESS_TOKEN_SKEW_MS = 15_000;

const listeners = new Set<() => void>();
let cachedSnapshot: AuthSession | null | undefined;

function invalidateSessionCache(): void {
  cachedSnapshot = undefined;
}

export function subscribeAuthSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyAuthSessionChange(): void {
  invalidateSessionCache();
  listeners.forEach((listener) => listener());
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function readAuthSession(): AuthSession | null {
  if (cachedSnapshot !== undefined) {
    if (cachedSnapshot && isRefreshTokenGone(cachedSnapshot)) {
      cachedSnapshot = null;
    }
    return cachedSnapshot;
  }

  const stored = getStoredSession();
  if (!stored || isRefreshTokenGone(stored)) {
    cachedSnapshot = null;
    return null;
  }

  cachedSnapshot = stored;
  return cachedSnapshot;
}

export function storeSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifyAuthSessionChange();
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  notifyAuthSessionChange();
}

function isRefreshTokenGone(session: AuthSession): boolean {
  if (!session.refreshToken) {
    return isAccessTokenExpired(session);
  }
  return false;
}

export function isAccessTokenExpired(session: AuthSession): boolean {
  return Date.now() >= session.expiresAt - ACCESS_TOKEN_SKEW_MS;
}

/** @deprecated Prefer isAccessTokenExpired; kept for callers that meant access TTL. */
export function isSessionExpired(session: AuthSession): boolean {
  return isAccessTokenExpired(session);
}
