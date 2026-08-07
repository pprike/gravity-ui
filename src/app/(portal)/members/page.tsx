"use client";

import { Users } from "lucide-react";
import { SectionPage } from "@/components/sections/SectionPage";

export default function MembersPage() {
  return (
    <SectionPage
      icon={Users}
      title="No members yet"
      description="When members join your organization, you'll search profiles, view attendance history, and manage accounts from here."
      actionLabel="Add member"
    />
  );
}
