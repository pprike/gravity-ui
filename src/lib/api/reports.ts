import { apiRequest } from "@/lib/api/client";
import { demoRevenueReport, demoRetentionReport } from "@/lib/reports/demo";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import type {
  RevenueDateRangePreset,
  RevenueReport,
  RetentionReport,
} from "@/lib/types/reports";

function resolveDateRange(preset: RevenueDateRangePreset): { from?: string; to?: string } {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);

  switch (preset) {
    case "30d": {
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - 30);
      return { from: fromDate.toISOString().slice(0, 10), to };
    }
    case "90d": {
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - 90);
      return { from: fromDate.toISOString().slice(0, 10), to };
    }
    case "ytd":
      return { from: `${today.getFullYear()}-01-01`, to };
    case "6mo":
    default:
      return {};
  }
}

export async function getRevenueReport(
  preset: RevenueDateRangePreset = "6mo",
): Promise<RevenueReport> {
  if (demoMembershipsEnabled()) {
    return demoRevenueReport;
  }

  const { from, to } = resolveDateRange(preset);
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();

  return apiRequest<RevenueReport>(
    `/api/v1/reports/revenue${query ? `?${query}` : ""}`,
  );
}

export async function getRetentionReport(): Promise<RetentionReport> {
  if (demoMembershipsEnabled()) {
    return demoRetentionReport;
  }

  return apiRequest<RetentionReport>("/api/v1/reports/retention");
}
