import { ApiClientError, apiRequest } from "@/lib/api/client";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import type {
  CreateMemberPayload,
  CreateMemberResult,
  MemberAccountStatus,
  MemberSearchPage,
  MemberSearchResult,
  PatchableMemberAccountStatus,
  UpdateMemberStatusResult,
} from "@/lib/types/member";

export function normalizeMemberAccountStatus(
  status: string | null | undefined,
): MemberAccountStatus {
  const normalized = status?.trim().toLowerCase();
  if (normalized === "disabled" || normalized === "inactive") {
    return "disabled";
  }
  if (normalized === "invited" || normalized === "pending") {
    return "invited";
  }
  return "active";
}

function isPatchableMemberStatus(
  status: MemberAccountStatus,
): status is PatchableMemberAccountStatus {
  return status === "active" || status === "disabled";
}

export function shouldPatchMemberStatus(
  savedStatus: MemberAccountStatus,
  nextStatus: MemberAccountStatus,
): nextStatus is PatchableMemberAccountStatus {
  return (
    savedStatus !== nextStatus &&
    isPatchableMemberStatus(nextStatus)
  );
}

/** Demo roster aligned with Figma members-list (3:2789). */
const DEMO_MEMBERS: MemberSearchResult[] = [
  {
    id: "demo-member-1",
    email: "alex@email.com",
    displayName: "Alex Rivera",
    phone: "+1 555-0101",
    avatarUrl: null,
    status: "active",
    membershipPlanName: "Premium Monthly",
    membershipStatus: "active",
    lastVisitAt: "2026-08-04T18:00:00.000Z",
  },
  {
    id: "demo-member-2",
    email: "j.chen@email.com",
    displayName: "Jessica Chen",
    phone: "+1 555-0102",
    avatarUrl: null,
    status: "active",
    membershipPlanName: "Premium Monthly",
    membershipStatus: "active",
    lastVisitAt: new Date().toISOString(),
  },
  {
    id: "demo-member-5",
    email: "marcus.t@gmail.com",
    displayName: "Marcus Thompson",
    phone: "+1 555-0105",
    avatarUrl: null,
    status: "active",
    membershipPlanName: "All-Access Annual",
    membershipStatus: "active",
  },
  {
    id: "demo-member-4",
    email: "sarah.l@hotmail.com",
    displayName: "Sarah Lindqvist",
    phone: "+1 555-0104",
    avatarUrl: null,
    status: "disabled",
    membershipPlanName: "Weekend Pass",
    membershipStatus: "cancelled",
  },
  {
    id: "demo-member-6",
    email: "david.kim@outlook.com",
    displayName: "David Kim",
    phone: "+1 555-0106",
    avatarUrl: null,
    status: "active",
    membershipPlanName: "Basic Tier",
    membershipStatus: "active",
  },
  {
    id: "demo-member-7",
    email: "elena.r@email.com",
    displayName: "Elena Rostova",
    phone: "+1 555-0107",
    avatarUrl: null,
    status: "active",
    membershipPlanName: "All-Access Annual",
    membershipStatus: "active",
  },
  {
    id: "demo-member-3",
    email: "james.carter@work.com",
    displayName: "James Carter",
    phone: "+1 555-0103",
    avatarUrl: null,
    status: "invited",
    membershipPlanName: "Corporate Wellness",
    membershipStatus: null,
  },
  {
    id: "demo-member-8",
    email: "aisha.d@diallo.org",
    displayName: "Aisha Diallo",
    phone: "+1 555-0108",
    avatarUrl: null,
    status: "active",
    membershipPlanName: "Premium Monthly",
    membershipStatus: "active",
  },
];

export function normalizeMember(raw: MemberSearchResult): MemberSearchResult {
  const record = raw as MemberSearchResult & {
    planName?: string | null;
    subscriptionStatus?: string | null;
  };

  return {
    ...raw,
    status: normalizeMemberAccountStatus(raw.status),
    membershipPlanName:
      raw.membershipPlanName ?? record.planName ?? null,
    membershipStatus:
      raw.membershipStatus ?? record.subscriptionStatus ?? null,
  };
}

function filterDemoMembers(query?: string): MemberSearchResult[] {
  if (!query || query.trim().length < 2) {
    return DEMO_MEMBERS.map(normalizeMember);
  }
  const normalized = query.trim().toLowerCase();
  return DEMO_MEMBERS.filter(
    (member) =>
      member.displayName?.toLowerCase().includes(normalized) ||
      member.email.toLowerCase().includes(normalized) ||
      member.phone?.toLowerCase().includes(normalized),
  ).map(normalizeMember);
}

export interface SearchMembersOptions {
  query?: string;
  status?: string;
  plan?: string;
  page?: number;
  size?: number;
}

export async function searchMembersPage(
  options: SearchMembersOptions = {},
): Promise<MemberSearchPage> {
  const { query, status, plan, page = 0, size = 50 } = options;

  if (demoMembershipsEnabled()) {
    let results = filterDemoMembers(query);
    if (status && status !== "all") {
      results = results.filter((member) => member.status === status);
    }
    if (plan === "none") {
      results = results.filter((member) => !member.membershipPlanName);
    } else if (plan && plan !== "all") {
      results = results.filter((member) => member.membershipPlanName === plan);
    }
    const start = page * size;
    const items = results.slice(start, start + size);
    return { items, page, size, total: results.length };
  }

  const params = new URLSearchParams();
  if (query && query.trim().length >= 2) {
    params.set("search", query.trim());
  }
  if (status && status !== "all") {
    params.set("status", status);
  }
  if (plan && plan !== "all") {
    params.set("plan", plan);
  }
  params.set("page", String(page));
  params.set("size", String(size));

  const response = await apiRequest<MemberSearchPage>(
    `/api/v1/users?${params.toString()}`,
  );
  return {
    ...response,
    items: response.items.map(normalizeMember),
  };
}

export async function searchMembers(
  query?: string,
): Promise<MemberSearchResult[]> {
  const page = await searchMembersPage({ query, page: 0, size: 50 });
  return page.items;
}

export async function getMember(
  userId: string,
): Promise<MemberSearchResult | null> {
  if (demoMembershipsEnabled()) {
    const member = DEMO_MEMBERS.find((entry) => entry.id === userId);
    return member ? normalizeMember(member) : null;
  }

  try {
    const summary = await apiRequest<MemberSearchResult>(
      `/api/v1/users/${userId}`,
    );
    return normalizeMember(summary);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createMember(
  payload: CreateMemberPayload,
): Promise<CreateMemberResult> {
  if (demoMembershipsEnabled()) {
    const email = payload.email.trim().toLowerCase();
    const duplicate = DEMO_MEMBERS.some(
      (member) => member.email.toLowerCase() === email,
    );
    if (duplicate) {
      throw new ApiClientError(
        "A user with this email already exists.",
        "CONFLICT",
        409,
      );
    }
    return {
      id: `demo-member-${Date.now()}`,
      email,
      displayName: payload.displayName.trim(),
      phone: payload.phone?.trim() ?? null,
      status: "invited",
      invitationToken: "demo-invitation-token",
    };
  }

  return apiRequest<CreateMemberResult>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email.trim(),
      displayName: payload.displayName.trim(),
      phone: payload.phone?.trim() ?? "",
    }),
  });
}

export function updateDemoMemberPlan(userId: string, planName: string): void {
  const member = DEMO_MEMBERS.find((entry) => entry.id === userId);
  if (!member) {
    throw new ApiClientError("Member not found.", "NOT_FOUND", 404);
  }
  member.membershipPlanName = planName;
}

export async function updateMemberStatus(
  userId: string,
  status: PatchableMemberAccountStatus,
): Promise<UpdateMemberStatusResult> {
  if (demoMembershipsEnabled()) {
    const member = DEMO_MEMBERS.find((entry) => entry.id === userId);
    if (!member) {
      throw new ApiClientError("Member not found.", "NOT_FOUND", 404);
    }
    if (member.status === "invited" && status === "active") {
      throw new ApiClientError(
        "Invited members must activate via the invitation link before becoming active.",
        "VALIDATION_ERROR",
        400,
      );
    }
    member.status = status;
    return {
      id: member.id,
      email: member.email,
      status: member.status,
    };
  }

  return apiRequest<UpdateMemberStatusResult>(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
