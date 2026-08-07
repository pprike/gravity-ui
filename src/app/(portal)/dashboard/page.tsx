"use client";

import { LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionPage } from "@/components/sections/SectionPage";
import { useAuth } from "@/lib/auth/context";
import { getPrimaryRole } from "@/lib/navigation/config";

const roleMessages: Record<string, { title: string; description: string }> = {
  ADMIN: {
    title: "Operational overview",
    description:
      "KPIs, alerts, and quick actions will appear here. Connect your organization data to see live metrics.",
  },
  OWNER: {
    title: "Business overview",
    description:
      "Revenue, retention, and high-level performance metrics will surface here for owner visibility.",
  },
  COACH: {
    title: "Today's schedule",
    description:
      "Your upcoming classes and roster context will appear here to help you prepare for sessions.",
  },
  RECEPTIONIST: {
    title: "Front desk",
    description:
      "Member lookup, check-ins, and front-desk quick actions will be available from this dashboard.",
  },
  MEMBER: {
    title: "Member dashboard",
    description: "Your membership and booking overview will appear here.",
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user ? getPrimaryRole(user.roles) : "ADMIN";
  const message = roleMessages[role] ?? roleMessages.ADMIN;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active members", value: "—" },
          { label: "Classes today", value: "—" },
          { label: "Check-ins", value: "—" },
          { label: "Open alerts", value: "—" },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-caption text-neutral-500">{stat.label}</p>
            <p className="mt-1 text-display text-neutral-900">{stat.value}</p>
          </Card>
        ))}
      </div>
      <SectionPage
        icon={LayoutDashboard}
        title={message.title}
        description={message.description}
        actionLabel="Coming soon"
      />
    </div>
  );
}
