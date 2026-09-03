import { isDemoSession } from "@/lib/settings/demo";
import type {
  BillingOverview,
  BookingRules,
  MemberSubscriptionAssignment,
  MembershipPlan,
  SubscriptionStatus,
} from "@/lib/types/memberships";
import type { UserProfile } from "@/lib/types/profile";

const DEMO_MEMBERSHIPS_KEY = "gravity-demo-memberships";
const DEMO_PROFILES_KEY = "gravity-demo-profiles";

interface DemoMembershipStore {
  plans: MembershipPlan[];
  bookingRules: BookingRules;
}

const DEFAULT_PLANS: MembershipPlan[] = [
  {
    id: "plan-1",
    tenantId: "demo-org",
    name: "Premium Monthly",
    description: "Unlimited classes and full facility access.",
    priceCents: 4900,
    currency: "USD",
    billingInterval: "monthly",
    classCredits: null,
    status: "active",
    stripeProductId: null,
    stripePriceId: null,
    activeMemberCount: 312,
    locationIds: [],
  },
  {
    id: "plan-2",
    tenantId: "demo-org",
    name: "Basic Monthly",
    description: "12 classes per month.",
    priceCents: 2900,
    currency: "USD",
    billingInterval: "monthly",
    classCredits: 12,
    status: "active",
    stripeProductId: null,
    stripePriceId: null,
    activeMemberCount: 198,
    locationIds: ["loc-2"],
  },
  {
    id: "plan-3",
    tenantId: "demo-org",
    name: "Drop-In",
    description: "Single class credit.",
    priceCents: 1500,
    currency: "USD",
    billingInterval: "monthly",
    classCredits: 1,
    status: "active",
    stripeProductId: null,
    stripePriceId: null,
    activeMemberCount: 45,
    locationIds: [],
  },
  {
    id: "plan-4",
    tenantId: "demo-org",
    name: "Student Special",
    description: "8 classes per month for students.",
    priceCents: 2500,
    currency: "USD",
    billingInterval: "monthly",
    classCredits: 8,
    status: "active",
    stripeProductId: null,
    stripePriceId: null,
    activeMemberCount: 67,
    locationIds: ["loc-1", "loc-3"],
  },
  {
    id: "plan-5",
    tenantId: "demo-org",
    name: "Annual Unlimited",
    description: "Unlimited classes billed annually.",
    priceCents: 39900,
    currency: "USD",
    billingInterval: "yearly",
    classCredits: null,
    status: "active",
    stripeProductId: null,
    stripePriceId: null,
    activeMemberCount: 89,
    locationIds: [],
  },
  {
    id: "plan-6",
    tenantId: "demo-org",
    name: "Corporate Flex",
    description: "16 classes per month for corporate teams.",
    priceCents: 3500,
    currency: "USD",
    billingInterval: "monthly",
    classCredits: 16,
    status: "inactive",
    stripeProductId: null,
    stripePriceId: null,
    activeMemberCount: 0,
    locationIds: ["loc-1"],
  },
];

const DEFAULT_BOOKING_RULES: BookingRules = {
  id: "rules-1",
  tenantId: "demo-org",
  cancellationWindowHours: 12,
  advanceBookingLimitDays: 7,
  maxActiveBookings: 6,
  waitlistEnabled: true,
};

function readMembershipStore(): DemoMembershipStore {
  if (typeof window === "undefined") {
    return { plans: structuredClone(DEFAULT_PLANS), bookingRules: DEFAULT_BOOKING_RULES };
  }
  try {
    const raw = localStorage.getItem(DEMO_MEMBERSHIPS_KEY);
    if (!raw) {
      return { plans: structuredClone(DEFAULT_PLANS), bookingRules: DEFAULT_BOOKING_RULES };
    }
    const parsed = JSON.parse(raw) as Partial<DemoMembershipStore>;
    return {
      plans: parsed.plans ?? structuredClone(DEFAULT_PLANS),
      bookingRules: parsed.bookingRules ?? DEFAULT_BOOKING_RULES,
    };
  } catch {
    return { plans: structuredClone(DEFAULT_PLANS), bookingRules: DEFAULT_BOOKING_RULES };
  }
}

function writeMembershipStore(store: DemoMembershipStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_MEMBERSHIPS_KEY, JSON.stringify(store));
}

function readProfileStore(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DEMO_PROFILES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, UserProfile>;
  } catch {
    return {};
  }
}

function writeProfileStore(store: Record<string, UserProfile>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_PROFILES_KEY, JSON.stringify(store));
}

export function demoMembershipsEnabled(): boolean {
  return isDemoSession();
}

export const demoMemberships = {
  getPlans(): MembershipPlan[] {
    return readMembershipStore().plans;
  },
  getPlan(id: string): MembershipPlan | undefined {
    return readMembershipStore().plans.find((p) => p.id === id);
  },
  savePlan(plan: MembershipPlan): MembershipPlan {
    const store = readMembershipStore();
    const index = store.plans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      store.plans[index] = plan;
    } else {
      store.plans.push(plan);
    }
    writeMembershipStore(store);
    return plan;
  },
  deletePlan(id: string): void {
    const store = readMembershipStore();
    store.plans = store.plans.filter((p) => p.id !== id);
    writeMembershipStore(store);
  },
  getBookingRules(): BookingRules {
    return readMembershipStore().bookingRules;
  },
  saveBookingRules(rules: BookingRules): BookingRules {
    const store = readMembershipStore();
    store.bookingRules = rules;
    writeMembershipStore(store);
    return rules;
  },
  getProfile(userId: string): UserProfile {
    const stored = readProfileStore()[userId];
    if (stored) return stored;
    const nameFromId = userId
      .replace(/^demo-member-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return {
      userId,
      roles: ["MEMBER"],
      member: {
        displayName: nameFromId || "Member",
        phone: null,
        avatarUrl: null,
        emergencyContact: null,
      },
      coach: null,
      admin: null,
      receptionist: null,
    };
  },
  saveProfile(profile: UserProfile): UserProfile {
    const store = readProfileStore();
    store[profile.userId] = profile;
    writeProfileStore(store);
    return profile;
  },
  listAssignments(filters?: {
    planId?: string;
    status?: SubscriptionStatus;
  }): MemberSubscriptionAssignment[] {
    const assignments: MemberSubscriptionAssignment[] = [
      {
        subscriptionId: "sub-1",
        userId: "demo-member-1",
        memberName: "Alex Rivera",
        memberEmail: "alex@email.com",
        planId: "plan-1",
        planName: "Premium Monthly",
        status: "active",
        startedAt: "2026-01-15T10:00:00Z",
        updatedAt: "2026-08-20T10:00:00Z",
      },
      {
        subscriptionId: "sub-2",
        userId: "demo-member-2",
        memberName: "Jessica Chen",
        memberEmail: "j.chen@email.com",
        planId: "plan-2",
        planName: "Basic Monthly",
        status: "active",
        startedAt: "2026-03-01T10:00:00Z",
        updatedAt: "2026-08-18T10:00:00Z",
      },
      {
        subscriptionId: "sub-3",
        userId: "demo-member-4",
        memberName: "Sarah Lindqvist",
        memberEmail: "sarah.l@hotmail.com",
        planId: "plan-3",
        planName: "Drop-In",
        status: "paused",
        startedAt: "2025-11-10T10:00:00Z",
        updatedAt: "2026-07-02T10:00:00Z",
      },
      {
        subscriptionId: "sub-4",
        userId: "demo-member-3",
        memberName: "James Carter",
        memberEmail: "james.carter@work.com",
        planId: "plan-1",
        planName: "Premium Monthly",
        status: "cancelled",
        startedAt: "2025-06-01T10:00:00Z",
        updatedAt: "2026-05-30T10:00:00Z",
      },
    ];

    return assignments.filter((assignment) => {
      if (filters?.planId && assignment.planId !== filters.planId) return false;
      if (filters?.status && assignment.status !== filters.status) return false;
      return true;
    });
  },
  getBillingOverview(): BillingOverview {
    return {
      activeCount: 510,
      pastDueCount: 12,
      cancelledCount: 34,
      recentTransactions: [
        {
          id: "txn-1",
          userId: "demo-member-1",
          memberName: "Alex Rivera",
          description: "Invoice inv_demo_001",
          amountCents: 4900,
          currency: "USD",
          status: "succeeded",
          stripeCustomerId: "cus_demo_alex",
          createdAt: "2026-08-28T14:22:00Z",
        },
        {
          id: "txn-2",
          userId: "demo-member-2",
          memberName: "Jessica Chen",
          description: "Invoice inv_demo_002",
          amountCents: 2900,
          currency: "USD",
          status: "succeeded",
          stripeCustomerId: "cus_demo_jess",
          createdAt: "2026-08-28T11:05:00Z",
        },
        {
          id: "txn-3",
          userId: "demo-member-5",
          memberName: "Marcus Thompson",
          description: "Payment",
          amountCents: 39900,
          currency: "USD",
          status: "failed",
          stripeCustomerId: "cus_demo_marcus",
          createdAt: "2026-08-27T09:15:00Z",
        },
      ],
    };
  },
};
