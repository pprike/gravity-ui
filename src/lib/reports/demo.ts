import type { RevenueReport } from "@/lib/types/reports";

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
