import { isDemoSession } from "@/lib/settings/demo";
import type {
  BookingRules,
  MembershipPlan,
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
    return {
      userId,
      roles: ["MEMBER"],
      member: {
        displayName: "Jessica Chen",
        phone: "(555) 382-9102",
        avatarUrl: null,
        emergencyContact: {
          name: "Robert Chen",
          phone: "(555) 912-3049",
          relationship: "Brother",
        },
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
};
