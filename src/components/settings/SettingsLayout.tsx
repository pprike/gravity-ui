"use client";

import { SettingsTabs, getTabLabel } from "@/components/settings/SettingsTabs";
import type { SettingsTab } from "@/lib/types/settings";

interface SettingsLayoutProps {
  activeTab: SettingsTab;
  children: React.ReactNode;
}

export function SettingsLayout({ activeTab, children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Settings
        </p>
        <h1 className="mt-1 text-[28px] font-bold text-slate-800">{getTabLabel(activeTab)}</h1>
      </div>
      <SettingsTabs activeTab={activeTab} />
      <div>{children}</div>
    </div>
  );
}
