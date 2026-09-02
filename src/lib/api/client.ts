import {
  clearSession,
  getStoredSession,
  isAccessTokenExpired,
  storeSession,
} from "@/lib/auth/storage";
import { redirectToLogin } from "@/lib/api/session-redirect";
import type { AuthSession } from "@/lib/types/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080";

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

export interface ApiResponse<T> {
  data: T | null;
  meta: Record<string, unknown>;
  error: ApiError | null;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: ApiError["details"],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function parseApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text.trim()) {
    if (!response.ok) {
      throw new ApiClientError(
        `Request failed with status ${response.status}.`,
        "REQUEST_FAILED",
        response.status,
      );
    }
    return { data: null, meta: {}, error: null };
  }

  const looksLikeJson =
    contentType.includes("application/json") || text.trimStart().startsWith("{");

  if (!looksLikeJson) {
    throw new ApiClientError(
      response.ok
        ? "Server returned an unexpected response format."
        : `Server error (${response.status}). The API may be unavailable or misconfigured.`,
      "INVALID_RESPONSE",
      response.status,
    );
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Server returned an unreadable response (${response.status}).`,
      "INVALID_JSON",
      response.status,
    );
  }
}

let refreshInFlight: Promise<AuthSession | null> | null = null;

async function refreshAccessToken(): Promise<AuthSession | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const session = getStoredSession();
    if (!session?.refreshToken) return null;
    if (session.accessToken === "demo-access-token") {
      const nextSession: AuthSession = {
        ...session,
        expiresAt: Date.now() + session.expiresIn * 1000,
      };
      storeSession(nextSession);
      return nextSession;
    }

    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    let payload;
    try {
      payload = await parseApiResponse<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: AuthSession["user"];
      }>(response);
    } catch {
      clearSession();
      return null;
    }

    if (!payload.data) {
      clearSession();
      return null;
    }

    const nextSession: AuthSession = {
      accessToken: payload.data.accessToken,
      refreshToken: payload.data.refreshToken,
      expiresIn: payload.data.expiresIn,
      user: payload.data.user,
      expiresAt: Date.now() + payload.data.expiresIn * 1000,
    };

    storeSession(nextSession);
    return nextSession;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

async function sessionForRequest(): Promise<AuthSession | null> {
  const session = getStoredSession();
  if (!session) return null;
  if (!isAccessTokenExpired(session)) return session;
  if (!session.refreshToken) return session;
  return (await refreshAccessToken()) ?? session;
}

function throwSessionExpired(): never {
  redirectToLogin();
  throw new ApiClientError(
    "Your session has expired. Please sign in again.",
    "SESSION_EXPIRED",
    401,
  );
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const session = await sessionForRequest();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (retry && session?.refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiRequest<T>(path, options, false);
      }
    }
    throwSessionExpired();
  }

  const payload = await parseApiResponse<T>(response);

  if (!response.ok || payload.error) {
    throw new ApiClientError(
      payload.error?.message ?? "Request failed",
      payload.error?.code ?? "REQUEST_FAILED",
      response.status,
      payload.error?.details,
    );
  }

  return payload.data as T;
}

export async function apiUpload<T>(
  path: string,
  fieldName: string,
  file: File,
  retry = true,
): Promise<T> {
  const session = await sessionForRequest();
  const headers = new Headers();

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (response.status === 401) {
    if (retry && session?.refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiUpload<T>(path, fieldName, file, false);
      }
    }
    throwSessionExpired();
  }

  const payload = await parseApiResponse<T>(response);

  if (!response.ok || payload.error) {
    throw new ApiClientError(
      payload.error?.message ?? "Upload failed",
      payload.error?.code ?? "UPLOAD_FAILED",
      response.status,
      payload.error?.details,
    );
  }

  return payload.data as T;
}

export { API_BASE };
