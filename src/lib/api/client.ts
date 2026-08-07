import {
  clearSession,
  getStoredSession,
  storeSession,
} from "@/lib/auth/storage";
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

async function refreshAccessToken(): Promise<AuthSession | null> {
  const session = getStoredSession();
  if (!session?.refreshToken) return null;

  const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const payload = (await response.json()) as ApiResponse<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthSession["user"];
  }>;

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
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const session = getStoredSession();
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

  if (response.status === 401 && retry && session?.refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  const payload = (await response.json()) as ApiResponse<T>;

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
  const session = getStoredSession();
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

  if (response.status === 401 && retry && session?.refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiUpload<T>(path, fieldName, file, false);
    }
  }

  const payload = (await response.json()) as ApiResponse<T>;

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
