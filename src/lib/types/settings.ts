export type SettingsTab =
  | "organization"
  | "locations"
  | "staff"
  | "branding"
  | "notifications";

export interface Organization {
  id: string;
  slug: string;
  name: string;
  status: string;
  settings: Record<string, unknown>;
}

export interface UpdateOrganizationPayload {
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
}

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  timezone: string | null;
  capacity: number | null;
  status: "active" | "inactive";
}

export interface CreateLocationPayload {
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
  timezone?: string;
  capacity?: number;
  status?: "active" | "inactive";
}

export interface UpdateLocationPayload {
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
  timezone: string;
  capacity?: number;
  status: "active" | "inactive";
}

export interface Branding {
  primaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  fontFamily: string | null;
}

export interface UpdateBrandingPayload {
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface UserRoles {
  userId: string;
  roles: string[];
}

export type StaffStatus = "active" | "invited" | "inactive";

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  roleName: string;
  locationIds: string[];
  status: StaffStatus;
}

export interface InviteStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  locationIds: string[];
}
