import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const NAV_ITEMS: Record<string, NavItem> = {
  dashboard: {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview, KPIs, and quick actions",
  },
  members: {
    label: "Members",
    href: "/members",
    icon: Users,
    description: "Search, profiles, and member management",
  },
  schedule: {
    label: "Schedule",
    href: "/schedule",
    icon: Calendar,
    description: "Classes, calendar, and rosters",
  },
  memberships: {
    label: "Memberships",
    href: "/memberships",
    icon: CreditCard,
    description: "Plans, assignments, and billing",
  },
  attendance: {
    label: "Attendance",
    href: "/attendance",
    icon: UserCheck,
    description: "Check-ins, QR scans, and records",
  },
  communication: {
    label: "Communication",
    href: "/communication",
    icon: MessageSquare,
    description: "Announcements and messages",
  },
  reports: {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Revenue, retention, and attendance",
  },
  settings: {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Organization, roles, and branding",
  },
};

const ROLE_NAV_KEYS: Record<UserRole, string[]> = {
  ADMIN: [
    "dashboard",
    "members",
    "schedule",
    "memberships",
    "attendance",
    "communication",
    "reports",
    "settings",
  ],
  OWNER: ["dashboard", "reports", "settings"],
  COACH: ["dashboard", "schedule", "attendance"],
  RECEPTIONIST: ["dashboard", "members", "attendance"],
  MEMBER: ["dashboard"],
};

export function getNavItemsForRoles(roles: UserRole[]): NavItem[] {
  const keys = new Set<string>();

  for (const role of roles) {
    for (const key of ROLE_NAV_KEYS[role] ?? []) {
      keys.add(key);
    }
  }

  return Array.from(keys)
    .map((key) => NAV_ITEMS[key])
    .filter(Boolean);
}

export function canAccessRoute(roles: UserRole[], pathname: string): boolean {
  const allowedHrefs = getNavItemsForRoles(roles).map((item) => item.href);
  return allowedHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
}

export function getPrimaryRole(roles: UserRole[]): UserRole {
  const priority: UserRole[] = [
    "ADMIN",
    "OWNER",
    "COACH",
    "RECEPTIONIST",
    "MEMBER",
  ];
  return priority.find((role) => roles.includes(role)) ?? roles[0] ?? "MEMBER";
}

export function getDashboardPath(_roles: UserRole[]): string {
  return "/dashboard";
}
