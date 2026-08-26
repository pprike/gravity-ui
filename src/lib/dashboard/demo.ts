import type { ExecutiveDashboard } from "@/lib/types/dashboard";

export const demoExecutiveDashboard: ExecutiveDashboard = {
  revenue: {
    mtdCents: 4_258_000,
    priorMtdCents: 3_940_000,
    currency: "USD",
  },
  activeMemberships: {
    count: 847,
    priorCount: 756,
  },
  classOccupancy: {
    avgPercent: 72,
    sessionsToday: 14,
    nearFullCount: 3,
    fullCount: 2,
  },
  checkInsToday: {
    count: 203,
    priorDayCount: 172,
  },
  todaySessions: [
    {
      id: "session-hiit-burn",
      name: "HIIT Strength",
      coachName: "Coach Marcus",
      timeRange: "10:00/11:00",
      bookedCount: 18,
      capacity: 20,
      status: "ALMOST FULL",
    },
    {
      id: "session-power-vinyasa",
      name: "Power Yoga",
      coachName: "Coach Elena",
      timeRange: "11:30/12:30",
      bookedCount: 9,
      capacity: 20,
      status: "OPEN",
    },
    {
      id: "session-iron-cycle",
      name: "Spin Express",
      coachName: "Coach Ryan",
      timeRange: "12:45/13:30",
      bookedCount: 20,
      capacity: 20,
      status: "FULL",
    },
  ],
  recentCheckIns: [
    {
      userId: "demo-member-1",
      displayName: "Alex Rivera",
      memberCode: "#M-1042",
      checkedInAt: new Date().toISOString(),
      status: "ACTIVE",
    },
    {
      userId: "demo-member-2",
      displayName: "Jordan Lee",
      memberCode: "#M-0881",
      checkedInAt: new Date(Date.now() - 6 * 60_000).toISOString(),
      status: "ACTIVE",
    },
    {
      userId: "demo-member-3",
      displayName: "Sam Patel",
      memberCode: "#M-1204",
      checkedInAt: new Date(Date.now() - 19 * 60_000).toISOString(),
      status: "PENDING RENEWAL",
    },
    {
      userId: "demo-member-4",
      displayName: "Taylor Brooks",
      memberCode: "#M-0763",
      checkedInAt: new Date(Date.now() - 33 * 60_000).toISOString(),
      status: "ACTIVE",
    },
  ],
};
