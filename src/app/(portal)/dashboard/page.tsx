"use client";

import { ExecutiveDashboardView } from "@/components/dashboard/ExecutiveDashboardView";
import { OperationalDashboardView } from "@/components/dashboard/OperationalDashboardView";
import { useAuth } from "@/lib/auth/context";
import type { UserRole } from "@/lib/types/auth";

function isExecutiveRole(roles: UserRole[]): boolean {
  return roles.includes("OWNER") || roles.includes("ADMIN");
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? "there";
  const roles = user?.roles ?? [];

  if (isExecutiveRole(roles)) {
    return <ExecutiveDashboardView firstName={firstName} />;
  }

  return <OperationalDashboardView firstName={firstName} />;
}
