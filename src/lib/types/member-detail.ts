export type MemberDetailTab =
  | "overview"
  | "bookings"
  | "attendance"
  | "membership"
  | "notes";

export type BookingStatus = "confirmed" | "completed" | "cancelled";

export interface MemberBookingRow {
  id: string;
  startsAt: string;
  className: string;
  coachName: string;
  status: BookingStatus;
}

export interface MemberAttendanceSummary {
  totalVisits: number;
  visitsThisMonth: number;
  averagePerWeek: number;
  longestStreakDays: number;
  attendedDates: string[];
  recentCheckIns: Array<{
    id: string;
    checkedInAt: string;
    locationName: string;
  }>;
}

export interface MemberMembershipDetail {
  planName: string;
  priceLabel: string;
  renewalLabel: string;
  features: string[];
  guestPassesRemaining: number;
  guestPassesTotal: number;
  lockerNumber: string | null;
  lockerActive: boolean;
  paymentMethod: {
    brand: string;
    last4: string;
    expiresLabel: string;
  } | null;
  billingHistory: Array<{
    id: string;
    date: string;
    description: string;
    amount: string;
    status: "paid" | "failed" | "pending";
  }>;
}

export interface MemberNote {
  id: string;
  authorName: string;
  authorRole: string;
  roleBadge: "trainer" | "front-desk" | "staff";
  createdAt: string;
  body: string;
}

export interface MemberDetailData {
  memberSince: string;
  overview: {
    planPrice: string;
    planRenewal: string;
    planFeatures: string[];
    classesThisMonth: number;
    totalVisits: number;
    weeklyConsistency: boolean[];
    upcomingBookings: Array<{ title: string; subtitle: string }>;
  };
  bookings: MemberBookingRow[];
  attendance: MemberAttendanceSummary;
  membership: MemberMembershipDetail;
  notes: MemberNote[];
}
