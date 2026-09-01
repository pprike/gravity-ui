import type { Location } from "@/lib/types/settings";
import { isDemoSession } from "@/lib/settings/demo";

const DEMO_MEMBER_COUNTS: Record<string, number> = {
  "loc-1": 312,
  "loc-2": 235,
  "loc-3": 0,
};

export function getLocationPhone(location: Location): string | null {
  if (location.phone) {
    return location.phone;
  }
  if (location.addressLine2?.startsWith("tel:")) {
    return location.addressLine2.slice(4);
  }
  if (location.addressLine2 && /[\d()+-]/.test(location.addressLine2)) {
    return location.addressLine2;
  }
  return null;
}

export function getLocationMemberLabel(location: Location): string | null {
  if (isDemoSession()) {
    const demoCount = DEMO_MEMBER_COUNTS[location.id];
    if (demoCount !== undefined) {
      return `${demoCount} active members`;
    }
  }
  if (location.capacity != null) {
    return `Capacity: ${location.capacity}`;
  }
  return null;
}

export function formatLocationStreet(location: Location): string {
  return location.addressLine1 ?? "No address on file";
}
