"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import type { SettingsTab } from "@/lib/types/settings";

export const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
}> = [
  { id: "organization", label: "Organization" },
  { id: "locations", label: "Locations" },
  { id: "staff", label: "Staff & Roles" },
  { id: "booking-rules", label: "Booking Rules" },
  { id: "branding", label: "Branding" },
  { id: "store-listing", label: "App Store" },
  { id: "notifications", label: "Notifications" },
  { id: "audit-logs", label: "Audit Log" },
];

const PAGE_TITLES: Record<SettingsTab, string> = {
  organization: "Organization Settings",
  locations: "Locations",
  staff: "Staff & Roles",
  "booking-rules": "Booking Rules",
  branding: "Branding",
  "store-listing": "App Store Listing",
  notifications: "Notifications",
  "audit-logs": "Audit Log",
};

export function getTabLabel(tab: SettingsTab): string {
  return PAGE_TITLES[tab] ?? "Settings";
}

interface SettingsTabsProps {
  activeTab: SettingsTab;
}

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  return (
    <nav
      className="flex gap-6 overflow-x-auto"
      aria-label="Settings sections"
    >
      {SETTINGS_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/settings?tab=${tab.id}`}
          className={clsx(
            "whitespace-nowrap border-b-2 pb-1 text-sm transition-colors",
            activeTab === tab.id
              ? "border-primary-600 font-semibold text-primary-600"
              : "border-transparent font-medium text-slate-500 hover:text-slate-700",
          )}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function useSettingsTab(): SettingsTab {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") as SettingsTab | null;
  const valid = SETTINGS_TABS.some((t) => t.id === tab);
  return valid && tab ? tab : "organization";
}
