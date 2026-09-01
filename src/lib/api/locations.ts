import { apiRequest } from "@/lib/api/client";
import { demoSettings, isDemoSession } from "@/lib/settings/demo";
import type {
  CreateLocationPayload,
  Location,
  UpdateLocationPayload,
} from "@/lib/types/settings";

export async function listLocations(): Promise<Location[]> {
  if (isDemoSession()) return demoSettings.getLocations();
  return apiRequest<Location[]>("/api/v1/locations");
}

export async function createLocation(
  payload: CreateLocationPayload,
): Promise<Location> {
  if (isDemoSession()) {
    const location: Location = {
      id: `loc-${Date.now()}`,
      tenantId: "demo-org",
      name: payload.name,
      addressLine1: payload.addressLine1 ?? null,
      addressLine2: payload.addressLine2 ?? null,
      phone: payload.phone ?? null,
      city: payload.city ?? null,
      region: payload.region ?? null,
      postalCode: payload.postalCode ?? null,
      countryCode: payload.countryCode ?? "US",
      timezone: payload.timezone ?? "America/Chicago",
      capacity: payload.capacity ?? null,
      status: payload.status ?? "active",
    };
    return demoSettings.saveLocation(location);
  }
  return apiRequest<Location>("/api/v1/locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLocation(
  id: string,
  payload: UpdateLocationPayload,
): Promise<Location> {
  if (isDemoSession()) {
    const existing = demoSettings.getLocations().find((l) => l.id === id);
    if (!existing) throw new Error("Location not found");
    return demoSettings.saveLocation({ ...existing, ...payload });
  }
  return apiRequest<Location>(`/api/v1/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteLocation(id: string): Promise<void> {
  if (isDemoSession()) {
    demoSettings.deleteLocation(id);
    return;
  }
  await apiRequest<null>(`/api/v1/locations/${id}`, { method: "DELETE" });
}
