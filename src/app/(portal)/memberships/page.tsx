"use client";

import { CreditCard } from "lucide-react";
import { SectionPage } from "@/components/sections/SectionPage";

export default function MembershipsPage() {
  return (
    <SectionPage
      icon={CreditCard}
      title="No membership plans"
      description="Create membership plans, assign members, and track billing status from this section."
      actionLabel="Create plan"
    />
  );
}
