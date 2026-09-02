"use client";

import { DashboardView } from "@/components/dashboard/ExecutiveDashboardView";
import { useAuth } from "@/lib/auth/context";

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? "there";

  return <DashboardView firstName={firstName} />;
}
