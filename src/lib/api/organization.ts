import { apiRequest } from "@/lib/api/client";
import { demoSettings, isDemoSession } from "@/lib/settings/demo";
import type {
  Organization,
  UpdateOrganizationPayload,
} from "@/lib/types/settings";

export async function getOrganization(): Promise<Organization> {
  if (isDemoSession()) return demoSettings.getOrganization();
  return apiRequest<Organization>("/api/v1/organizations/current");
}

export async function updateOrganization(
  payload: UpdateOrganizationPayload,
): Promise<Organization> {
  if (isDemoSession()) {
    const current = demoSettings.getOrganization();
    return demoSettings.updateOrganization({
      ...current,
      name: payload.name,
      slug: payload.slug,
      settings: payload.settings
        ? { ...current.settings, ...payload.settings }
        : current.settings,
    });
  }
  return apiRequest<Organization>("/api/v1/organizations/current", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
