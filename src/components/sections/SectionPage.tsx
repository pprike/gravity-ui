import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface SectionPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}

export function SectionPage({
  icon,
  title,
  description,
  actionLabel = "Get started",
}: SectionPageProps) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={() => {}}
    />
  );
}
