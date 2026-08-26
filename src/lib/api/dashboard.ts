import { apiRequest } from "@/lib/api/client";
import { demoExecutiveDashboard } from "@/lib/dashboard/demo";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import type { ExecutiveDashboard } from "@/lib/types/dashboard";

export async function getExecutiveDashboard(
  locationId?: string,
): Promise<ExecutiveDashboard> {
  if (demoMembershipsEnabled()) {
    return demoExecutiveDashboard;
  }

  const params = new URLSearchParams();
  if (locationId) params.set("locationId", locationId);
  const query = params.toString();
  return apiRequest<ExecutiveDashboard>(
    `/api/v1/reports/dashboard${query ? `?${query}` : ""}`,
  );
}
