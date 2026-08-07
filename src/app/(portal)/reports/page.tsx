"use client";

import { BarChart3 } from "lucide-react";
import { SectionPage } from "@/components/sections/SectionPage";

export default function ReportsPage() {
  return (
    <SectionPage
      icon={BarChart3}
      title="Reports coming soon"
      description="Revenue, retention, and attendance reports will help you understand business performance at a glance."
      actionLabel="View sample report"
    />
  );
}
