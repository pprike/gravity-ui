"use client";

import { MessageSquare } from "lucide-react";
import { SectionPage } from "@/components/sections/SectionPage";

export default function CommunicationPage() {
  return (
    <SectionPage
      icon={MessageSquare}
      title="No announcements yet"
      description="Send announcements and messages to members and staff from this communication hub."
      actionLabel="New announcement"
    />
  );
}
