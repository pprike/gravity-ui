export type BillingInterval = "weekly" | "monthly" | "yearly";
export type PlanStatus = "active" | "inactive";
export type PlanType = "recurring" | "class_pack" | "drop_in";

export interface MembershipPlan {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingInterval: BillingInterval;
  classCredits: number | null;
  status: PlanStatus;
  stripeProductId: string | null;
  stripePriceId: string | null;
  activeMemberCount?: number;
}

export interface CreateMembershipPlanPayload {
  name: string;
  description?: string;
  priceCents: number;
  currency?: string;
  billingInterval: BillingInterval;
  classCredits?: number | null;
  status?: PlanStatus;
}

export interface UpdateMembershipPlanPayload {
  name: string;
  description?: string;
  priceCents: number;
  currency?: string;
  billingInterval: BillingInterval;
  classCredits?: number | null;
  status: PlanStatus;
}

export interface BookingRules {
  id: string;
  tenantId: string;
  cancellationWindowHours: number;
  advanceBookingLimitDays: number;
  maxActiveBookings: number;
  waitlistEnabled: boolean;
}

export interface UpdateBookingRulesPayload {
  cancellationWindowHours: number;
  advanceBookingLimitDays: number;
  maxActiveBookings: number;
  waitlistEnabled: boolean;
}

export type MembershipsTab = "plans" | "booking-rules";
