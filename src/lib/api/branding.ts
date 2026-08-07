import { apiRequest, apiUpload } from "@/lib/api/client";
import { demoSettings, isDemoSession } from "@/lib/settings/demo";
import type { Branding, UpdateBrandingPayload } from "@/lib/types/settings";

export async function getBranding(): Promise<Branding> {
  if (isDemoSession()) return demoSettings.getBranding();
  return apiRequest<Branding>("/api/v1/organizations/current/branding");
}

export async function updateBranding(
  payload: UpdateBrandingPayload,
): Promise<Branding> {
  if (isDemoSession()) {
    const current = demoSettings.getBranding();
    return demoSettings.updateBranding({ ...current, ...payload });
  }
  return apiRequest<Branding>("/api/v1/organizations/current/branding", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadLogo(file: File): Promise<string> {
  if (isDemoSession()) {
    const url = URL.createObjectURL(file);
    const current = demoSettings.getBranding();
    demoSettings.updateBranding({ ...current, logoUrl: url });
    return url;
  }
  const result = await apiUpload<{ logoUrl: string }>(
    "/api/v1/organizations/current/branding/logo",
    "file",
    file,
  );
  return result.logoUrl;
}
