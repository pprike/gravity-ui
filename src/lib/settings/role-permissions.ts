import { NAV_ITEMS } from "@/lib/navigation/config";

const ROLE_NAV_KEYS: Record<string, string[]> = {
  Admin: ["dashboard", "members", "schedule", "memberships", "attendance", "communication", "reports", "settings"],
  Owner: ["dashboard", "reports", "settings"],
  Coach: ["dashboard", "schedule", "attendance"],
  Receptionist: ["dashboard", "members", "attendance"],
  Member: ["dashboard"],
};

export function getRoleNavigationHint(roleName: string): string {
  const keys = ROLE_NAV_KEYS[roleName];
  if (!keys?.length) return "Portal access varies by assigned permissions.";
  const labels = keys.map((key) => NAV_ITEMS[key]?.label).filter(Boolean);
  return `Can access: ${labels.join(", ")}`;
}