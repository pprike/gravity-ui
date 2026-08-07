"use client";

import { UserCheck } from "lucide-react";
import { SectionPage } from "@/components/sections/SectionPage";

export default function AttendancePage() {
  return (
    <SectionPage
      icon={UserCheck}
      title="No attendance records"
      description="Check-in lists, QR scans, and attendance history will appear here as members attend classes."
      actionLabel="Record check-in"
    />
  );
}
