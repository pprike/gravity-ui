"use client";

import { use } from "react";
import { PlanWizard } from "@/components/memberships/PlanWizard";

interface EditMembershipPlanPageProps {
  params: Promise<{ planId: string }>;
}

export default function EditMembershipPlanPage({
  params,
}: EditMembershipPlanPageProps) {
  const { planId } = use(params);
  return <PlanWizard planId={planId} />;
}
