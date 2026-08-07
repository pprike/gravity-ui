export function getSettingValue<T>(
  settings: Record<string, unknown>,
  key: string,
  fallback?: T,
): T | undefined {
  const entry = settings[key];
  if (entry && typeof entry === "object" && entry !== null && "value" in entry) {
    return (entry as { value: T }).value;
  }
  if (entry !== undefined && entry !== null) {
    return entry as T;
  }
  return fallback;
}

export function buildSettingsUpdate(
  entries: Record<string, unknown>,
): Record<string, { value: unknown }> {
  const result: Record<string, { value: unknown }> = {};
  for (const [key, value] of Object.entries(entries)) {
    result[key] = { value };
  }
  return result;
}

export function formatAddress(location: {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
}): string {
  const parts = [
    location.addressLine1,
    location.addressLine2,
    [location.city, location.region].filter(Boolean).join(", "),
    location.postalCode,
  ].filter(Boolean);
  return parts.join(" · ") || "No address on file";
}
