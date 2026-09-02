"use client";

import { DashboardView } from "@/components/dashboard/ExecutiveDashboardView";

interface OperationalDashboardViewProps {
  firstName: string;
}

export function OperationalDashboardView({
  firstName,
}: OperationalDashboardViewProps) {
  return <DashboardView firstName={firstName} />;
}
