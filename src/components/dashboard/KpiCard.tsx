import Link from "next/link";
import { clsx } from "clsx";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  footnote: string;
  href?: string;
  positive?: boolean;
}

export function KpiCard({
  label,
  value,
  delta,
  footnote,
  href,
  positive = true,
}: KpiCardProps) {
  const content = (
    <Card
      padding="sm"
      className={clsx(
        "h-full p-6",
        href && "transition-shadow group-hover:shadow-md",
      )}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <span
          className={clsx(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700",
          )}
        >
          {positive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {delta}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{footnote}</p>
    </Card>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group block">
      {content}
    </Link>
  );
}
