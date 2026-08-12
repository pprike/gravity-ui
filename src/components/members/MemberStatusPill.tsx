import type { MemberSearchResult } from "@/lib/types/member";

export type MemberDisplayStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export function displayStatus(member: MemberSearchResult): MemberDisplayStatus {
  if (member.status === "disabled") return "INACTIVE";
  if (member.status === "invited") return "PENDING";
  return "ACTIVE";
}

const STATUS_CONFIG: Record<
  MemberDisplayStatus,
  { label: string; dot: string; pill: string }
> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-rose-500",
    pill: "border-rose-200 bg-rose-50 text-rose-700",
  },
  PENDING: {
    label: "Pending",
    dot: "bg-amber-500",
    pill: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

interface MemberStatusPillProps {
  status: MemberDisplayStatus;
}

export function MemberStatusPill({ status }: MemberStatusPillProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.pill}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${config.dot}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
