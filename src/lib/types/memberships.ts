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
  /** Empty array means the plan is valid at all locations. */
  locationIds: string[];
}

export interface CreateMembershipPlanPayload {
  name: string;
  description?: string;
  priceCents: number;
  currency?: string;
  billingInterval: BillingInterval;
  classCredits?: number | null;
  status?: PlanStatus;
  locationIds?: string[];
}

export interface UpdateMembershipPlanPayload {
  name: string;
  description?: string;
  priceCents: number;
  currency?: string;
  billingInterval: BillingInterval;
  classCredits?: number | null;
  status: PlanStatus;
  locationIds: string[];
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

export type MembershipsTab = "plans" | "assignments" | "billing";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface MemberSubscriptionAssignment {
  subscriptionId: string;
  userId: string;
  memberName: string;
  memberEmail: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startedAt: string;
  updatedAt: string;
}

export interface BillingTransactionSummary {
  id: string;
  userId: string | null;
  memberName: string;
  description: string;
  amountCents: number;
  currency: string;
  status: string;
  stripeCustomerId: string | null;
  createdAt: string;
}

export interface BillingOverview {
  activeCount: number;
  pastDueCount: number;
  cancelledCount: number;
  recentTransactions: BillingTransactionSummary[];
}
