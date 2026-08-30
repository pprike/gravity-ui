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
