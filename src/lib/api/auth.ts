import { apiRequest } from "@/lib/api/client";
import { storeSession } from "@/lib/auth/storage";
import type {
  ActivateInviteRequest,
  AuthSession,
  AuthTokens,
  AuthUser,
  LoginApiResponse,
  LoginRequest,
  LoginResult,
} from "@/lib/types/auth";

function toSession(data: AuthTokens): AuthSession {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    user: data.user,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
}

export async function login(request: LoginRequest): Promise<LoginResult> {
  const data = await apiRequest<LoginApiResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: request.email,
      password: request.password,
      ...(request.tenantSlug ? { tenantSlug: request.tenantSlug } : {}),
    }),
  });

  if (data.tenantSelectionRequired) {
    return {
      kind: "tenantSelection",
      tenants: data.tenants ?? [],
    };
  }

  if (!data.auth) {
    throw new Error("Login response did not include auth tokens.");
  }

  const session = toSession(data.auth);
  storeSession(session);
  return { kind: "authenticated", session };
}

export async function activateInvite(
  request: ActivateInviteRequest,
): Promise<AuthSession> {
  const data = await apiRequest<AuthTokens>("/api/v1/auth/activate-invite", {
    method: "POST",
    body: JSON.stringify(request),
  });

  const session = toSession(data);
  storeSession(session);
  return session;
}

export async function logout(): Promise<void> {
  const session = (await import("@/lib/auth/storage")).getStoredSession();
  if (session?.refreshToken) {
    try {
      await apiRequest<null>("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
    } catch {
      // Best-effort server logout
    }
  }
  (await import("@/lib/auth/storage")).clearSession();
}

export function createDemoSession(role: AuthUser["roles"][number]): AuthSession {
  const session: AuthSession = {
    accessToken: "demo-access-token",
    refreshToken: "demo-refresh-token",
    expiresIn: 3600,
    expiresAt: Date.now() + 3600 * 1000,
    user: {
      id: `demo-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@demo.gravity.app`,
      firstName: "Demo",
      lastName: role.charAt(0) + role.slice(1).toLowerCase(),
      roles: [role],
    },
  };
  storeSession(session);
  return session;
}
