"use client";

import { Calendar } from "lucide-react";
import { SectionPage } from "@/components/sections/SectionPage";

export default function SchedulePage() {
  return (
    <SectionPage
      icon={Calendar}
      title="No classes scheduled"
      description="Set up your class calendar, configure sessions, and manage rosters once your schedule is ready."
      actionLabel="Create class"
    />
  );
}
