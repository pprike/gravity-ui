"use client";

import { useState } from "react";
import { FrontDeskCheckInView } from "@/components/attendance/FrontDeskCheckInView";
import { QrScannerView } from "@/components/attendance/QrScannerView";

type AttendanceTab = "front-desk" | "qr-scanner";

const TABS: Array<{ id: AttendanceTab; label: string }> = [
  { id: "front-desk", label: "Front desk" },
  { id: "qr-scanner", label: "QR scanner" },
];

export function AttendanceHubView() {
  const [activeTab, setActiveTab] = useState<AttendanceTab>("front-desk");

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2 border-b border-neutral-200 pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-b-2 border-primary-600 text-primary-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "front-desk" ? <FrontDeskCheckInView embedded /> : <QrScannerView />}
    </div>
  );
}
