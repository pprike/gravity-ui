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
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
  expiresAt: number;
}

export interface LoginRequest {
  tenantSlug: string;
  email: string;
  password: string;
}

export interface ActivateInviteRequest {
  token: string;
  password: string;
}
