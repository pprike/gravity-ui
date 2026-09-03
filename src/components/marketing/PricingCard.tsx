import Link from "next/link";
import { Check } from "lucide-react";
import { clsx } from "clsx";

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export function PricingCard({
  tier,
  price,
  period = "/month",
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={clsx(
        "relative flex flex-col rounded-panel border p-8 shadow-card",
        highlighted
          ? "border-primary-500 bg-primary-600 text-white shadow-glow"
          : "border-neutral-200/80 bg-surface",
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-0.5 text-xs font-semibold text-white shadow-soft">
          {badge}
        </span>
      )}

      <p
        className={clsx(
          "mb-1 text-xs font-semibold uppercase tracking-wider",
          highlighted ? "text-primary-100" : "text-primary-700",
        )}
      >
        {tier}
      </p>

      <div className="mb-1 flex items-end gap-1">
        <span
          className={clsx(
            "text-4xl font-bold tracking-tight",
            highlighted ? "text-white" : "text-ink",
          )}
        >
          {price}
        </span>
        {price !== "Custom" && (
          <span
            className={clsx(
              "mb-1 text-sm",
              highlighted ? "text-primary-100" : "text-neutral-500",
            )}
          >
            {period}
          </span>
        )}
      </div>

      <p
        className={clsx(
          "mb-6 text-sm",
          highlighted ? "text-primary-100" : "text-neutral-600",
        )}
      >
        {description}
      </p>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check
              className={clsx(
                "mt-0.5 size-4 shrink-0",
                highlighted ? "text-primary-200" : "text-primary-600",
              )}
            />
            <span className={highlighted ? "text-primary-50" : "text-neutral-700"}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={clsx(
          "inline-flex items-center justify-center rounded-control px-4 py-2.5 text-sm font-semibold transition-all",
          highlighted
            ? "bg-white text-primary-700 hover:bg-primary-50"
            : "bg-primary-600 text-white shadow-soft hover:bg-primary-700 hover:shadow-glow",
        )}
      >
        {cta}
      </Link>
    </div>
  );
}
