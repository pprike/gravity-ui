import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={clsx(
        "rounded-panel border border-neutral-200/80 bg-surface p-6 shadow-card transition-shadow hover:shadow-lift",
        className,
      )}
    >
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mb-2 text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
    </div>
  );
}
