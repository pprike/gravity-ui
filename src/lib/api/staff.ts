import { apiRequest } from "@/lib/api/client";
import { demoSettings, isDemoSession } from "@/lib/settings/demo";
import type { Role, StaffMember, UserRoles } from "@/lib/types/settings";

export async function listRoles(): Promise<Role[]> {
  if (isDemoSession()) return demoSettings.getRoles();
  return apiRequest<Role[]>("/api/v1/roles");
}

export async function getUserRoles(userId: string): Promise<UserRoles> {
  return apiRequest<UserRoles>(`/api/v1/users/${userId}/roles`);
}

export async function assignUserRoles(
  userId: string,
  roleIds: string[],
): Promise<UserRoles> {
  if (isDemoSession()) {
    const staff = demoSettings.getStaff().find((s) => s.id === userId);
    const role = demoSettings.getRoles().find((r) => r.id === roleIds[0]);
    if (staff && role) {
      demoSettings.saveStaff({
        ...staff,
        roleId: role.id,
        roleName: role.name,
      });
    }
    return { userId, roles: role ? [role.name] : [] };
  }
  return apiRequest<UserRoles>(`/api/v1/users/${userId}/roles`, {
    method: "PUT",
    body: JSON.stringify({ roleIds }),
  });
}

export async function listStaff(): Promise<StaffMember[]> {
  if (isDemoSession()) return demoSettings.getStaff();
  // Staff list endpoint not yet available — return empty until BE ships
  return [];
}
