import { apiRequest } from "@/lib/api/client";
import { demoSettings, isDemoSession } from "@/lib/settings/demo";
import type { InviteStaffPayload, Role, StaffMember, UserRoles } from "@/lib/types/settings";

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
  return apiRequest<StaffMember[]>("/api/v1/staff");
}

export async function inviteStaff(
  payload: InviteStaffPayload,
): Promise<StaffMember & { invitationToken: string }> {
  if (isDemoSession()) {
    const role = demoSettings.getRoles().find((entry) => entry.id === payload.roleId);
    if (!role) {
      throw new Error("Role not found.");
    }
    const member: StaffMember = {
      id: `staff-${Date.now()}`,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      roleId: role.id,
      roleName: role.name,
      locationIds: payload.locationIds,
      status: "invited",
    };
    demoSettings.saveStaff(member);
    return { ...member, invitationToken: "demo-invitation-token" };
  }

  return apiRequest<StaffMember & { invitationToken: string }>("/api/v1/staff/invites", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
