import { ApiClientError, apiRequest } from "@/lib/api/client";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import { getMemberDetailDemo } from "@/lib/members/member-detail-demo";
import type { MemberSearchResult } from "@/lib/types/member";
import type {
  BookingStatus,
  MemberAttendanceSummary,
  MemberBookingRow,
  MemberDetailData,
  MemberMembershipDetail,
  MemberNote,
} from "@/lib/types/member-detail";
import { normalizeMember } from "@/lib/api/members";

interface MemberSummaryApi {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  membershipPlanName: string | null;
  membershipStatus: string | null;
  memberSince: string | null;
  lastVisitAt: string | null;
}

interface MemberStatsApi {
  classesThisMonth: number;
  totalVisits: number;
  weeklyConsistency: boolean[];
  longestStreakDays: number;
}

interface StaffUpcomingBookingApi {
  bookingId: string;
  sessionId: string;
  className: string;
  startsAt: string;
  endsAt: string;
  coachName: string;
  bookingStatus: string;
  sessionStatus: string;
}

interface MemberBookingRowApi {
  id: string;
  startsAt: string;
  className: string;
  coachName: string;
  status: string;
}

interface MemberBookingPageApi {
  items: MemberBookingRowApi[];
  page: number;
  size: number;
  totalElements: number;
}

interface MemberAttendanceSummaryApi {
  totalVisits: number;
  visitsThisMonth: number;
  averagePerWeek: number;
  longestStreakDays: number;
}

interface MemberCheckInApi {
  id: string;
  checkedInAt: string;
  locationName: string;
}

interface MemberSubscriptionApi {
  planId: string | null;
  planName: string | null;
  priceLabel: string | null;
  renewalLabel: string | null;
  features: string[];
  status: string | null;
  remainingCredits: number | null;
}

interface MemberBillingHistoryItemApi {
  id: string;
  date: string;
  description: string;
  amountLabel: string;
  status: "paid" | "failed" | "pending" | string;
}

interface MemberNoteApi {
  id: string;
  authorName: string;
  authorRole: string;
  roleBadge: string;
  createdAt: string;
  body: string;
}

export interface MemberSummaryContext {
  member: MemberSearchResult;
  memberSince: string;
}

function formatInstantDate(value: string | null | undefined): string {
  if (!value) return "Member";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Member";
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function formatMemberSince(
  memberSince: string | null | undefined,
  planName: string | null,
): string {
  const label = formatInstantDate(memberSince);
  if (planName && memberSince) {
    return `${planName} Member Since ${label}`;
  }
  if (planName) return `${planName} Member`;
  if (memberSince) return `Member Since ${label}`;
  return "Member";
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatUpcomingSubtitle(booking: StaffUpcomingBookingApi): string {
  const when = new Date(booking.startsAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${when} • ${booking.coachName}`;
}

function mapBookingStatus(status: string): BookingStatus {
  if (status === "completed" || status === "cancelled") return status;
  return "confirmed";
}

function mapRoleBadge(
  value: string,
): "trainer" | "front-desk" | "staff" {
  if (value === "trainer" || value === "front-desk" || value === "staff") {
    return value;
  }
  return "staff";
}

function mapSummary(summary: MemberSummaryApi): MemberSummaryContext {
  const member = normalizeMember({
    id: summary.id,
    email: summary.email,
    displayName: summary.displayName,
    phone: summary.phone,
    avatarUrl: summary.avatarUrl,
    status: summary.status,
    membershipPlanName: summary.membershipPlanName,
    membershipStatus: summary.membershipStatus,
  });

  return {
    member,
    memberSince: formatMemberSince(
      summary.memberSince,
      summary.membershipPlanName,
    ),
  };
}

function mapBookings(items: MemberBookingRowApi[]): MemberBookingRow[] {
  return items.map((item) => ({
    id: item.id,
    startsAt: formatDateTime(item.startsAt),
    className: item.className,
    coachName: item.coachName,
    status: mapBookingStatus(item.status),
  }));
}

function mapNotes(items: MemberNoteApi[]): MemberNote[] {
  return items.map((item) => ({
    id: item.id,
    authorName: item.authorName,
    authorRole: item.authorRole,
    roleBadge: mapRoleBadge(item.roleBadge),
    createdAt: formatDateTime(item.createdAt),
    body: item.body,
  }));
}

function mapMembership(
  subscription: MemberSubscriptionApi,
  billingHistory: MemberBillingHistoryItemApi[],
): MemberMembershipDetail {
  const credits = subscription.remainingCredits ?? 0;

  return {
    planId: subscription.planId,
    planName: subscription.planName ?? "No plan assigned",
    priceLabel: subscription.priceLabel ?? "—",
    renewalLabel: subscription.renewalLabel ?? "—",
    features: subscription.features,
    guestPassesRemaining: credits,
    guestPassesTotal: credits,
    lockerNumber: null,
    lockerActive: false,
    paymentMethod: null,
    billingHistory: billingHistory.map((item) => ({
      id: item.id,
      date: formatDateTime(item.date),
      description: item.description,
      amount: item.amountLabel,
      status:
        item.status === "paid" ||
        item.status === "failed" ||
        item.status === "pending"
          ? item.status
          : "pending",
    })),
  };
}

const DEMO_NOTES_KEY = "gravity-demo-member-notes";
const DEMO_CHECKINS_KEY = "gravity-demo-member-checkins";

interface DemoCheckIn {
  id: string;
  userId: string;
  checkedInAt: string;
  locationName: string;
}

function readDemoNotes(userId: string): MemberNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEMO_NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, MemberNote[]>;
    return parsed[userId] ?? [];
  } catch {
    return [];
  }
}

function writeDemoNotes(userId: string, notes: MemberNote[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(DEMO_NOTES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, MemberNote[]>) : {};
    parsed[userId] = notes;
    window.localStorage.setItem(DEMO_NOTES_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage failures in demo mode.
  }
}

function readDemoCheckIns(userId: string): DemoCheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEMO_CHECKINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DemoCheckIn[];
    return parsed.filter((entry) => entry.userId === userId);
  } catch {
    return [];
  }
}

function writeDemoCheckIn(entry: DemoCheckIn): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(DEMO_CHECKINS_KEY);
    const parsed = raw ? (JSON.parse(raw) as DemoCheckIn[]) : [];
    window.localStorage.setItem(
      DEMO_CHECKINS_KEY,
      JSON.stringify([entry, ...parsed]),
    );
  } catch {
    // Ignore storage failures in demo mode.
  }
}

export async function fetchMemberSummary(
  userId: string,
): Promise<MemberSummaryContext> {
  if (demoMembershipsEnabled()) {
    const { getMember } = await import("@/lib/api/members");
    const member = await getMember(userId);
    if (!member) throw new Error("Member not found.");
    const demo = getMemberDetailDemo(userId, member.membershipPlanName);
    return { member, memberSince: demo.memberSince };
  }

  const summary = await apiRequest<MemberSummaryApi>(`/api/v1/users/${userId}`);
  return mapSummary(summary);
}

export async function fetchMemberOverview(
  userId: string,
  planName: string | null,
): Promise<MemberDetailData["overview"]> {
  if (demoMembershipsEnabled()) {
    return getMemberDetailDemo(userId, planName).overview;
  }

  const [stats, upcoming, subscription] = await Promise.all([
    apiRequest<MemberStatsApi>(`/api/v1/users/${userId}/stats`),
    apiRequest<StaffUpcomingBookingApi[]>(
      `/api/v1/users/${userId}/class-bookings/upcoming?limit=5`,
    ),
    apiRequest<MemberSubscriptionApi>(
      `/api/v1/users/${userId}/subscription`,
    ).catch(() => null),
  ]);

  return {
    planPrice: subscription?.priceLabel ?? "",
    planRenewal: subscription?.renewalLabel ?? "",
    planFeatures: subscription?.features ?? [],
    classesThisMonth: stats.classesThisMonth,
    totalVisits: stats.totalVisits,
    weeklyConsistency: stats.weeklyConsistency,
    upcomingBookings: upcoming.map((booking) => ({
      title: booking.className,
      subtitle: formatUpcomingSubtitle(booking),
    })),
  };
}

export async function fetchMemberBookings(
  userId: string,
  options?: { status?: string },
): Promise<MemberBookingRow[]> {
  if (demoMembershipsEnabled()) {
    const bookings = getMemberDetailDemo(userId, null).bookings;
    if (!options?.status || options.status === "all") return bookings;
    return bookings.filter((booking) => booking.status === options.status);
  }

  const params = new URLSearchParams();
  if (options?.status && options.status !== "all") {
    params.set("status", options.status);
  }
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const page = await apiRequest<MemberBookingPageApi>(
    `/api/v1/users/${userId}/class-bookings${query}`,
  );
  return mapBookings(page.items);
}

export async function fetchMemberAttendance(
  userId: string,
  month: number,
  year: number,
): Promise<MemberAttendanceSummary> {
  if (demoMembershipsEnabled()) {
    const demo = getMemberDetailDemo(userId, null).attendance;
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendedDates: string[] = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      if (day % 3 === 0 || day % 7 === 0) {
        attendedDates.push(
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        );
      }
    }
    const extra = readDemoCheckIns(userId).filter((checkIn) => {
      const date = new Date(checkIn.checkedInAt);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
    for (const checkIn of extra) {
      const iso = new Date(checkIn.checkedInAt).toISOString().slice(0, 10);
      if (!attendedDates.includes(iso)) attendedDates.push(iso);
    }
    const recentCheckIns = [
      ...extra.map((checkIn) => ({
        id: checkIn.id,
        checkedInAt: formatDateTime(checkIn.checkedInAt),
        locationName: checkIn.locationName,
      })),
      ...demo.recentCheckIns,
    ].slice(0, 10);
    return {
      ...demo,
      attendedDates,
      visitsThisMonth: attendedDates.length,
      recentCheckIns,
    };
  }

  const [summary, attendedDates, recentCheckIns] = await Promise.all([
    apiRequest<MemberAttendanceSummaryApi>(
      `/api/v1/users/${userId}/attendance/summary`,
    ),
    apiRequest<string[]>(
      `/api/v1/users/${userId}/attendance?month=${month}&year=${year}`,
    ),
    apiRequest<MemberCheckInApi[]>(
      `/api/v1/users/${userId}/check-ins?limit=10`,
    ),
  ]);

  return {
    totalVisits: summary.totalVisits,
    visitsThisMonth: summary.visitsThisMonth,
    averagePerWeek: summary.averagePerWeek,
    longestStreakDays: summary.longestStreakDays,
    attendedDates,
    recentCheckIns: recentCheckIns.map((checkIn) => ({
      id: checkIn.id,
      checkedInAt: formatDateTime(checkIn.checkedInAt),
      locationName: checkIn.locationName,
    })),
  };
}

export async function checkInMember(userId: string): Promise<void> {
  if (demoMembershipsEnabled()) {
    const { updateDemoMemberVisit } = await import("@/lib/api/members");
    updateDemoMemberVisit(userId);
    writeDemoCheckIn({
      id: `checkin-${Date.now()}`,
      userId,
      checkedInAt: new Date().toISOString(),
      locationName: "Main Studio",
    });
    return;
  }

  await apiRequest<MemberCheckInApi>(`/api/v1/users/${userId}/check-ins`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export interface MemberSubscriptionSummary {
  planId: string | null;
  planName: string | null;
}

export async function fetchMemberSubscription(
  userId: string,
): Promise<MemberSubscriptionSummary> {
  if (demoMembershipsEnabled()) {
    const { getMember } = await import("@/lib/api/members");
    const { listMembershipPlans } = await import("@/lib/api/membership-plans");
    const member = await getMember(userId);
    if (!member) {
      return { planId: null, planName: null };
    }
    const plans = await listMembershipPlans();
    const match = plans.find((plan) => plan.name === member.membershipPlanName);
    return {
      planId: match?.id ?? null,
      planName: member.membershipPlanName,
    };
  }

  const subscription = await apiRequest<MemberSubscriptionApi>(
    `/api/v1/users/${userId}/subscription`,
  );
  return {
    planId: subscription.planId,
    planName: subscription.planName,
  };
}

export async function updateMemberSubscriptionPlan(
  userId: string,
  planId: string,
): Promise<MemberSubscriptionSummary> {
  if (demoMembershipsEnabled()) {
    const { demoMemberships } = await import("@/lib/memberships/demo");
    const plan = demoMemberships.getPlan(planId);
    if (!plan) {
      throw new ApiClientError("Membership plan not found.", "NOT_FOUND", 404);
    }
    const { updateDemoMemberPlan } = await import("@/lib/api/members");
    updateDemoMemberPlan(userId, plan.name);
    return { planId: plan.id, planName: plan.name };
  }

  const subscription = await apiRequest<MemberSubscriptionApi>(
    `/api/v1/users/${userId}/subscription/plan`,
    {
      method: "PUT",
      body: JSON.stringify({ planId }),
    },
  );
  return {
    planId: subscription.planId,
    planName: subscription.planName,
  };
}

export async function fetchMemberMembership(
  userId: string,
): Promise<MemberMembershipDetail> {
  if (demoMembershipsEnabled()) {
    return getMemberDetailDemo(userId, null).membership;
  }

  const [subscription, billingHistory] = await Promise.all([
    apiRequest<MemberSubscriptionApi>(
      `/api/v1/users/${userId}/subscription`,
    ),
    apiRequest<MemberBillingHistoryItemApi[]>(
      `/api/v1/users/${userId}/billing-history`,
    ),
  ]);

  return mapMembership(subscription, billingHistory);
}

export async function fetchMemberNotes(userId: string): Promise<MemberNote[]> {
  if (demoMembershipsEnabled()) {
    const stored = readDemoNotes(userId);
    const seed = getMemberDetailDemo(userId, null).notes;
    return [...stored, ...seed];
  }

  const notes = await apiRequest<MemberNoteApi[]>(
    `/api/v1/users/${userId}/notes`,
  );
  return mapNotes(notes);
}

export async function createMemberNote(
  userId: string,
  body: string,
): Promise<MemberNote> {
  if (demoMembershipsEnabled()) {
    const note: MemberNote = {
      id: `note-${Date.now()}`,
      authorName: "You",
      authorRole: "Staff",
      roleBadge: "staff",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      body,
    };
    const next = [note, ...readDemoNotes(userId)];
    writeDemoNotes(userId, next);
    return note;
  }

  const note = await apiRequest<MemberNoteApi>(
    `/api/v1/users/${userId}/notes`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
  return mapNotes([note])[0];
}
