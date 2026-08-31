export interface MemberSearchResult {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  membershipPlanName: string | null;
  membershipStatus: string | null;
  lastVisitAt?: string | null;
}

export interface CreateMemberPayload {
  email: string;
  displayName: string;
  phone?: string;
}

export interface CreateMemberResult {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  status: string;
  invitationToken: string;
}

export type MemberAccountStatus = "active" | "disabled" | "invited";

export type PatchableMemberAccountStatus = "active" | "disabled";

export interface UpdateMemberStatusResult {
  id: string;
  email: string;
  status: string;
}
