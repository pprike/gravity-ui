export type UserRole =
  | "ADMIN"
  | "OWNER"
  | "COACH"
  | "RECEPTIONIST"
  | "MEMBER";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface AuthSession extends AuthTokens {
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface TenantLoginOption {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
}

export interface LoginApiResponse {
  tenantSelectionRequired: boolean;
  auth: AuthTokens | null;
  tenants: TenantLoginOption[] | null;
}

export type LoginResult =
  | { kind: "authenticated"; session: AuthSession }
  | { kind: "tenantSelection"; tenants: TenantLoginOption[] };

export interface ActivateInviteRequest {
  token: string;
  password: string;
}
