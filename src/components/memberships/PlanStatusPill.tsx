import { clsx } from "clsx";
import type { MembershipPlan } from "@/lib/types/memberships";
import { planStatusLabel } from "@/lib/memberships/format";

interface PlanStatusPillProps {
  status: MembershipPlan["status"];
}

export function PlanStatusPill({ status }: PlanStatusPillProps) {
  const isActive = status === "active";

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
      )}
    >
      {planStatusLabel(status)}
    </span>
  );
}
