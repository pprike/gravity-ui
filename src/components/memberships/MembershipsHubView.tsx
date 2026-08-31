"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import { MembershipAssignmentsList } from "@/components/memberships/MembershipAssignmentsList";
import { MembershipBillingOverview } from "@/components/memberships/MembershipBillingOverview";
import { MembershipPlansList } from "@/components/memberships/MembershipPlansList";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/Button";
import type { MembershipsTab } from "@/lib/types/memberships";

const TABS: Array<{ id: MembershipsTab; label: string }> = [
  { id: "plans", label: "Plans" },
  { id: "assignments", label: "Assignments" },
  { id: "billing", label: "Billing" },
];

export function MembershipsHubView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MembershipsTab>("plans");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Memberships"
        subtitle="Plans, member assignments, and billing health."
        actions={
          activeTab === "plans" ? (
            <Button
              type="button"
              className="font-bold"
              onClick={() => router.push("/memberships/new")}
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          ) : null
        }
      />

      <nav className="flex flex-wrap gap-2 border-b border-neutral-200 pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-b-2 border-primary-600 text-primary-700"
                  : "text-slate-500 hover:text-slate-700",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "plans" ? (
        <MembershipPlansList embedded />
      ) : activeTab === "assignments" ? (
        <MembershipAssignmentsList embedded />
      ) : (
        <MembershipBillingOverview embedded />
      )}
    </div>
  );
}
