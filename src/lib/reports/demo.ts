import type { RetentionReport, RevenueReport } from "@/lib/types/reports";

export const demoRevenueReport: RevenueReport = {
  currency: "USD",
  mtdCents: 1845000,
  priorMtdCents: 1620000,
  totalRevenueCents: 9420000,
  mrrCents: 2150000,
  averageOrderValueCents: 12900,
  transactionCount: 730,
  monthlyTrend: [
    { month: "2026-03", revenueCents: 1280000, transactionCount: 98 },
    { month: "2026-04", revenueCents: 1410000, transactionCount: 104 },
    { month: "2026-05", revenueCents: 1525000, transactionCount: 112 },
    { month: "2026-06", revenueCents: 1620000, transactionCount: 118 },
    { month: "2026-07", revenueCents: 1740000, transactionCount: 121 },
    { month: "2026-08", revenueCents: 1845000, transactionCount: 127 },
  ],
};

export const demoRetentionReport: RetentionReport = {
  activeMembers: 186,
  priorActiveMembers: 178,
  retentionRatePercent: 95,
  churnedThisMonth: 4,
  inactiveDaysThreshold: 14,
  monthlyTrend: [
    { month: "2026-03", activeMembers: 142, retentionPercent: 100 },
    { month: "2026-04", activeMembers: 151, retentionPercent: 106 },
    { month: "2026-05", activeMembers: 158, retentionPercent: 105 },
    { month: "2026-06", activeMembers: 164, retentionPercent: 104 },
    { month: "2026-07", activeMembers: 172, retentionPercent: 105 },
    { month: "2026-08", activeMembers: 178, retentionPercent: 103 },
  ],
  cohorts: [
    { cohortMonth: "2026-05", memberCount: 28, retentionPercents: [100, 86, 79, 75, 71, 68] },
    { cohortMonth: "2026-06", memberCount: 24, retentionPercents: [100, 88, 83, 79, 75, 0] },
    { cohortMonth: "2026-07", memberCount: 31, retentionPercents: [100, 90, 84, 81, 0, 0] },
    { cohortMonth: "2026-08", memberCount: 19, retentionPercents: [100, 89, 0, 0, 0, 0] },
  ],
  atRiskMembers: [
    {
      userId: "demo-member-1",
      displayName: "Jordan Lee",
      email: "jordan@example.com",
      lastCheckInAt: null,
      daysSinceCheckIn: 21,
      subscriptionStatus: "active",
    },
    {
      userId: "demo-member-2",
      displayName: "Sam Rivera",
      email: "sam@example.com",
      lastCheckInAt: "2026-08-10T14:30:00Z",
      daysSinceCheckIn: 20,
      subscriptionStatus: "active",
    },
  ],
};
