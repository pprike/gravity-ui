"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/shell/PageHeader";
import { LocationComparisonReportView } from "@/components/reports/LocationComparisonReportView";
import { RetentionReportView } from "@/components/reports/RetentionReportView";
import { RevenueReportView } from "@/components/reports/RevenueReportView";
import type { ReportsTab } from "@/lib/types/reports";

const TABS: Array<{ id: ReportsTab; label: string }> = [
  { id: "revenue", label: "Revenue" },
  { id: "retention", label: "Retention" },
  { id: "locations", label: "Locations" },
];

export function ReportsHubView() {
  const [activeTab, setActiveTab] = useState<ReportsTab>("revenue");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Business performance, revenue, retention, and location insights."
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

      {activeTab === "revenue" ? (
        <RevenueReportView embedded />
      ) : activeTab === "retention" ? (
        <RetentionReportView embedded />
      ) : (
        <LocationComparisonReportView embedded />
      )}
    </div>
  );
}
