import type { BookingStatus } from "@/lib/types/member-detail";

const BOOKING_STATUS_STYLES: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700",
  },
  completed: {
    label: "Completed",
    className: "bg-slate-100 text-slate-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700",
  },
};

export function BookingStatusPill({ status }: { status: BookingStatus }) {
  const style = BOOKING_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function BillingStatusPill({
  status,
}: {
  status: "paid" | "failed" | "pending";
}) {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function NoteRoleBadge({
  role,
}: {
  role: "trainer" | "front-desk" | "staff";
}) {
  const styles = {
    trainer: "bg-emerald-50 text-emerald-700",
    "front-desk": "border border-neutral-200 bg-slate-50 text-slate-600",
    staff: "border border-neutral-200 bg-slate-50 text-slate-600",
  };
  const labels = {
    trainer: "Trainer",
    "front-desk": "Front Desk",
    staff: "Staff",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}
