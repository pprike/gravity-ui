"use client";

import { Suspense } from "react";
import { BrandingSettings } from "@/components/settings/BrandingSettings";
import { LocationsSettings } from "@/components/settings/LocationsSettings";
import { OrganizationSettingsForm } from "@/components/settings/OrganizationSettingsForm";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { StaffRolesSettings } from "@/components/settings/StaffRolesSettings";
import { useSettingsTab } from "@/components/settings/SettingsTabs";
import { Card } from "@/components/ui/Card";

function SettingsContent() {
  const tab = useSettingsTab();

  return (
    <SettingsLayout activeTab={tab}>
      {tab === "organization" && <OrganizationSettingsForm />}
      {tab === "locations" && <LocationsSettings />}
      {tab === "staff" && <StaffRolesSettings />}
      {tab === "branding" && <BrandingSettings />}
      {tab === "notifications" && (
        <Card className="text-center">
          <p className="text-body text-neutral-600">
            Notification preferences are coming soon.
          </p>
        </Card>
      )}
    </SettingsLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
