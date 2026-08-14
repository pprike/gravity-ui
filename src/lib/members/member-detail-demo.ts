import type { MemberDetailData } from "@/lib/types/member-detail";

const JESSICA_DETAIL: MemberDetailData = {
  memberSince: "Premium Member Since Oct 2024",
  overview: {
    planPrice: "$49/mo",
    planRenewal: "Renews on Sep 1, 2026",
    planFeatures: ["Unlimited Gym Access", "4 Free Guest Passes/mo"],
    classesThisMonth: 12,
    totalVisits: 156,
    weeklyConsistency: [true, true, false, true, false, true, false],
    upcomingBookings: [
      {
        title: "HIIT Performance & Core",
        subtitle: "Tomorrow, 8:00 AM • Coach Marcus",
      },
      {
        title: "Power Vinyasa Yoga",
        subtitle: "Friday, 6:00 PM • Coach Elena",
      },
      {
        title: "Barre Strength Fusion",
        subtitle: "Aug 10, 9:30 AM • Coach Sarah",
      },
    ],
  },
  bookings: [
    {
      id: "b1",
      startsAt: "Aug 11, 9:00 AM",
      className: "HIIT Performance & Core",
      coachName: "Coach Marcus",
      status: "confirmed",
    },
    {
      id: "b2",
      startsAt: "Aug 12, 6:00 PM",
      className: "Power Vinyasa Yoga",
      coachName: "Coach Elena",
      status: "confirmed",
    },
    {
      id: "b3",
      startsAt: "Aug 15, 8:30 AM",
      className: "Barre Strength Fusion",
      coachName: "Coach Sarah",
      status: "confirmed",
    },
    {
      id: "b4",
      startsAt: "Aug 8, 9:00 AM",
      className: "Spin & Sculpt",
      coachName: "Coach Marcus",
      status: "completed",
    },
    {
      id: "b5",
      startsAt: "Aug 5, 6:00 PM",
      className: "Power Vinyasa Yoga",
      coachName: "Coach Elena",
      status: "completed",
    },
    {
      id: "b6",
      startsAt: "Aug 3, 8:30 AM",
      className: "Boxing Fundamentals",
      coachName: "Coach James",
      status: "cancelled",
    },
  ],
  attendance: {
    totalVisits: 156,
    visitsThisMonth: 12,
    averagePerWeek: 3.2,
    longestStreakDays: 14,
    attendedDates: [
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      "2026-08-08",
      "2026-08-10",
      "2026-08-11",
      "2026-08-15",
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-23",
      "2026-08-25",
      "2026-08-31",
    ],
    recentCheckIns: [
      {
        id: "c1",
        checkedInAt: "Aug 31, 2026 • 6:15 PM",
        locationName: "Downtown HQ",
      },
      {
        id: "c2",
        checkedInAt: "Aug 25, 2026 • 7:30 AM",
        locationName: "Downtown HQ",
      },
      {
        id: "c3",
        checkedInAt: "Aug 23, 2026 • 5:45 PM",
        locationName: "Downtown HQ",
      },
      {
        id: "c4",
        checkedInAt: "Aug 18, 2026 • 6:00 AM",
        locationName: "Downtown HQ",
      },
      {
        id: "c5",
        checkedInAt: "Aug 16, 2026 • 7:15 PM",
        locationName: "Downtown HQ",
      },
      {
        id: "c6",
        checkedInAt: "Aug 11, 2026 • 8:45 AM",
        locationName: "Downtown HQ",
      },
    ],
  },
  membership: {
    planId: null,
    planName: "Premium Monthly",
    priceLabel: "$49/mo",
    renewalLabel: "Renews on Sep 1, 2026",
    features: [
      "Unlimited Gym Access",
      "4 Free Guest Passes/mo",
      "All Group Classes",
      "Locker Access",
    ],
    guestPassesRemaining: 4,
    guestPassesTotal: 4,
    lockerNumber: "247",
    lockerActive: true,
    paymentMethod: {
      brand: "Visa",
      last4: "4242",
      expiresLabel: "Expires 08/2028",
    },
    billingHistory: [
      {
        id: "inv1",
        date: "Sep 01, 2026",
        description: "Premium Monthly",
        amount: "$49.00",
        status: "paid",
      },
      {
        id: "inv2",
        date: "Aug 01, 2026",
        description: "Premium Monthly",
        amount: "$49.00",
        status: "paid",
      },
      {
        id: "inv3",
        date: "Jul 01, 2026",
        description: "Premium Monthly",
        amount: "$49.00",
        status: "paid",
      },
      {
        id: "inv4",
        date: "Jun 01, 2026",
        description: "Premium Monthly",
        amount: "$49.00",
        status: "paid",
      },
      {
        id: "inv5",
        date: "May 01, 2026",
        description: "Premium Monthly",
        amount: "$49.00",
        status: "paid",
      },
    ],
  },
  notes: [
    {
      id: "n1",
      authorName: "Coach Marcus",
      authorRole: "Trainer",
      roleBadge: "trainer",
      createdAt: "Jul 15, 2026",
      body: "Jessica prefers morning sessions and has been focusing on upper body strength training. She mentioned a previous shoulder injury - avoid overhead presses and recommend modified exercises for deltoids.",
    },
    {
      id: "n2",
      authorName: "Amy Rodriguez",
      authorRole: "Front Desk",
      roleBadge: "front-desk",
      createdAt: "Jun 28, 2026",
      body: "Issued a replacement parking pass (Pass #A-2847). Previous pass was reported lost. Valid for Downtown HQ location only.",
    },
  ],
};

const DEMO_DETAIL_BY_MEMBER: Record<string, MemberDetailData> = {
  "demo-member-2": JESSICA_DETAIL,
};

function defaultDetail(planName: string | null): MemberDetailData {
  return {
    memberSince: planName ? `${planName} Member` : "Member",
    overview: {
      planPrice: "",
      planRenewal: "",
      planFeatures: [],
      classesThisMonth: 0,
      totalVisits: 0,
      weeklyConsistency: [false, false, false, false, false, false, false],
      upcomingBookings: [],
    },
    bookings: [],
    attendance: {
      totalVisits: 0,
      visitsThisMonth: 0,
      averagePerWeek: 0,
      longestStreakDays: 0,
      attendedDates: [],
      recentCheckIns: [],
    },
    membership: {
      planId: null,
      planName: planName ?? "No plan assigned",
      priceLabel: "",
      renewalLabel: "",
      features: [],
      guestPassesRemaining: 0,
      guestPassesTotal: 0,
      lockerNumber: null,
      lockerActive: false,
      paymentMethod: null,
      billingHistory: [],
    },
    notes: [],
  };
}

export function getMemberDetailDemo(
  memberId: string,
  membershipPlanName: string | null,
): MemberDetailData {
  return (
    DEMO_DETAIL_BY_MEMBER[memberId] ??
    defaultDetail(membershipPlanName)
  );
}
