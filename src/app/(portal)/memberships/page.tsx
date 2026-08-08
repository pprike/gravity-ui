"use client";

import { Suspense } from "react";
import { MembershipPlansList } from "@/components/memberships/MembershipPlansList";

export default function MembershipsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      }
    >
      <MembershipPlansList />
    </Suspense>
  );
}
