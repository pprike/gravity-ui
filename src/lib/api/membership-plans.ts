import { ApiClientError, apiRequest } from "@/lib/api/client";
import { demoMemberships, demoMembershipsEnabled } from "@/lib/memberships/demo";
import type {
  CreateMembershipPlanPayload,
  MembershipPlan,
  UpdateMembershipPlanPayload,
} from "@/lib/types/memberships";

export async function listMembershipPlans(): Promise<MembershipPlan[]> {
  if (demoMembershipsEnabled()) return demoMemberships.getPlans();
  return apiRequest<MembershipPlan[]>("/api/v1/membership-plans");
}

export async function getMembershipPlan(id: string): Promise<MembershipPlan> {
  if (demoMembershipsEnabled()) {
    const plan = demoMemberships.getPlan(id);
    if (!plan) throw new ApiClientError("Plan not found", "NOT_FOUND", 404);
    return plan;
  }
  return apiRequest<MembershipPlan>(`/api/v1/membership-plans/${id}`);
}

export async function createMembershipPlan(
  payload: CreateMembershipPlanPayload,
): Promise<MembershipPlan> {
  if (demoMembershipsEnabled()) {
    const plan: MembershipPlan = {
      id: `plan-${Date.now()}`,
      tenantId: "demo-org",
      name: payload.name,
      description: payload.description ?? null,
      priceCents: payload.priceCents,
      currency: payload.currency ?? "USD",
      billingInterval: payload.billingInterval,
      classCredits: payload.classCredits ?? null,
      status: payload.status ?? "inactive",
      stripeProductId: null,
      stripePriceId: null,
      activeMemberCount: 0,
      locationIds: payload.locationIds ?? [],
    };
    return demoMemberships.savePlan(plan);
  }
  return apiRequest<MembershipPlan>("/api/v1/membership-plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMembershipPlan(
  id: string,
  payload: UpdateMembershipPlanPayload,
): Promise<MembershipPlan> {
  if (demoMembershipsEnabled()) {
    const existing = demoMemberships.getPlan(id);
    if (!existing) throw new ApiClientError("Plan not found", "NOT_FOUND", 404);
    return demoMemberships.savePlan({ ...existing, ...payload });
  }
  return apiRequest<MembershipPlan>(`/api/v1/membership-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMembershipPlan(id: string): Promise<void> {
  if (demoMembershipsEnabled()) {
    demoMemberships.deletePlan(id);
    return;
  }
  await apiRequest<null>(`/api/v1/membership-plans/${id}`, {
    method: "DELETE",
  });
}
