import { apiRequest } from "@/lib/api/client";
import { demoMembershipsEnabled, demoMemberships } from "@/lib/memberships/demo";
import type {
  BillingOverview,
  MemberSubscriptionAssignment,
  SubscriptionStatus,
} from "@/lib/types/memberships";

export async function listMemberSubscriptions(filters?: {
  planId?: string;
  status?: SubscriptionStatus;
}): Promise<MemberSubscriptionAssignment[]> {
  if (demoMembershipsEnabled()) {
    return demoMemberships.listAssignments(filters);
  }

  const params = new URLSearchParams();
  if (filters?.planId) params.set("planId", filters.planId);
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString();

  return apiRequest<MemberSubscriptionAssignment[]>(
    `/api/v1/member-subscriptions${query ? `?${query}` : ""}`,
  );
}

export async function getBillingOverview(): Promise<BillingOverview> {
  if (demoMembershipsEnabled()) {
    return demoMemberships.getBillingOverview();
  }

  return apiRequest<BillingOverview>("/api/v1/billing/overview");
}
