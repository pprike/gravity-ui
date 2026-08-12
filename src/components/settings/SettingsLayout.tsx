"use client";

import { SettingsTabs, getTabLabel } from "@/components/settings/SettingsTabs";
import { SettingsPortalHeader } from "@/components/shell/SettingsPortalHeader";
import type { SettingsTab } from "@/lib/types/settings";

interface SettingsLayoutProps {
  activeTab: SettingsTab;
  children: React.ReactNode;
}

export function SettingsLayout({ activeTab, children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      <SettingsPortalHeader eyebrow="Settings" title={getTabLabel(activeTab)} />
      <SettingsTabs activeTab={activeTab} />
      <div>{children}</div>
    </div>
  );
}
