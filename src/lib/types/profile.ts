export interface MemberProfileData {
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  emergencyContact: Record<string, string> | null;
}

export interface CoachProfileData {
  bio: string | null;
  specializations: string[] | null;
  avatarUrl: string | null;
}

export interface AdminProfileData {
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface ReceptionistProfileData {
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface UserProfile {
  userId: string;
  roles: string[];
  member: MemberProfileData | null;
  coach: CoachProfileData | null;
  admin: AdminProfileData | null;
  receptionist: ReceptionistProfileData | null;
}

export interface UpdateProfilePayload {
  displayName?: string;
  phone?: string;
  emergencyContact?: Record<string, string>;
  bio?: string;
  specializations?: string[];
}

export interface ProfileEditUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}
