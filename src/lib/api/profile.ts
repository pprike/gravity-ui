import { apiRequest, apiUpload } from "@/lib/api/client";
import { demoMembershipsEnabled, demoMemberships } from "@/lib/memberships/demo";
import type { UpdateProfilePayload, UserProfile } from "@/lib/types/profile";

export async function getUserProfile(userId: string): Promise<UserProfile> {
  if (demoMembershipsEnabled()) return demoMemberships.getProfile(userId);
  return apiRequest<UserProfile>(`/api/v1/users/${userId}/profile`);
}

export async function updateUserProfile(
  userId: string,
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  if (demoMembershipsEnabled()) {
    const current = demoMemberships.getProfile(userId);
    const member = current.member
      ? {
          ...current.member,
          displayName: payload.displayName ?? current.member.displayName,
          phone: payload.phone ?? current.member.phone,
          emergencyContact:
            payload.emergencyContact ?? current.member.emergencyContact,
        }
      : null;
    const coach = current.coach
      ? {
          ...current.coach,
          bio: payload.bio ?? current.coach.bio,
          specializations:
            payload.specializations ?? current.coach.specializations,
        }
      : null;
    const admin = current.admin
      ? {
          ...current.admin,
          displayName: payload.displayName ?? current.admin.displayName,
          phone: payload.phone ?? current.admin.phone,
        }
      : null;
    const receptionist = current.receptionist
      ? {
          ...current.receptionist,
          displayName: payload.displayName ?? current.receptionist.displayName,
          phone: payload.phone ?? current.receptionist.phone,
        }
      : null;
    return demoMemberships.saveProfile({
      ...current,
      member,
      coach,
      admin,
      receptionist,
    });
  }
  return apiRequest<UserProfile>(`/api/v1/users/${userId}/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadProfileAvatar(
  userId: string,
  file: File,
): Promise<UserProfile> {
  if (demoMembershipsEnabled()) {
    const current = demoMemberships.getProfile(userId);
    const objectUrl = URL.createObjectURL(file);
    const updated: UserProfile = {
      ...current,
      member: current.member
        ? { ...current.member, avatarUrl: objectUrl }
        : null,
      coach: current.coach
        ? { ...current.coach, avatarUrl: objectUrl }
        : null,
      admin: current.admin
        ? { ...current.admin, avatarUrl: objectUrl }
        : null,
      receptionist: current.receptionist
        ? { ...current.receptionist, avatarUrl: objectUrl }
        : null,
    };
    return demoMemberships.saveProfile(updated);
  }
  return apiUpload<UserProfile>(
    `/api/v1/users/${userId}/profile/avatar`,
    "file",
    file,
  );
}
