import type { AuthSession } from "@/lib/types/auth";

const SESSION_KEY = "gravity_auth_session";

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
    if (cachedSnapshot && isSessionExpired(cachedSnapshot)) {
      cachedSnapshot = null;
    }
    return cachedSnapshot;
  }

  const stored = getStoredSession();
  if (!stored || isSessionExpired(stored)) {
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

export function isSessionExpired(session: AuthSession): boolean {
  return Date.now() >= session.expiresAt;
}
