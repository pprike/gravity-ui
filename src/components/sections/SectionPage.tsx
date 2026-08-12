"use client";

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/shell/PageHeader";

interface SectionPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}

export function SectionPage({
  icon: Icon,
  title,
  description,
  actionLabel = "Coming soon",
}: SectionPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} />
      <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary-600/10 text-primary-600">
          <Icon className="size-7" />
        </div>
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
        <span className="mt-6 inline-flex rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-slate-500">
          {actionLabel}
        </span>
      </Card>
    </div>
  );
}
