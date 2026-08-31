export interface RevenueMonthlyTrendPoint {
  month: string;
  revenueCents: number;
  transactionCount: number;
}

export interface RevenueReport {
  currency: string;
  mtdCents: number;
  priorMtdCents: number;
  totalRevenueCents: number;
  mrrCents: number;
  averageOrderValueCents: number;
  transactionCount: number;
  monthlyTrend: RevenueMonthlyTrendPoint[];
}

export type RevenueDateRangePreset = "30d" | "90d" | "6mo" | "ytd";

export interface RetentionMonthlyTrendPoint {
  month: string;
  activeMembers: number;
  retentionPercent: number;
}

export interface RetentionCohort {
  cohortMonth: string;
  memberCount: number;
  retentionPercents: number[];
}

export interface AtRiskMember {
  userId: string;
  displayName: string;
  email: string;
  lastCheckInAt: string | null;
  daysSinceCheckIn: number;
  subscriptionStatus: string;
}

export interface RetentionReport {
  activeMembers: number;
  priorActiveMembers: number;
  retentionRatePercent: number;
  churnedThisMonth: number;
  inactiveDaysThreshold: number;
  monthlyTrend: RetentionMonthlyTrendPoint[];
  cohorts: RetentionCohort[];
  atRiskMembers: AtRiskMember[];
}

export type ReportsTab = "revenue" | "retention";
