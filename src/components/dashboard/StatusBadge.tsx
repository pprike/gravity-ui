import { clsx } from "clsx";

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <span
      className={clsx(
        "inline-flex whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-bold tracking-wide",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-red-50 text-red-700",
        tone === "neutral" && "bg-slate-100 text-slate-600",
      )}
    >
      {label}
    </span>
  );
}

export function sessionStatusTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  if (status === "OPEN") return "success";
  if (status === "FULL") return "danger";
  if (status === "ALMOST FULL") return "warning";
  return "neutral";
}

export function checkInStatusTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  return status === "ACTIVE" ? "success" : "warning";
}
