export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDeltaPercent(current: number, prior: number): string {
  if (prior <= 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const delta = ((current - prior) / prior) * 100;
  const rounded = Math.round(delta);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

export function formatSessionTimeRange(value: string): string {
  const [startRaw, endRaw] = value.split("/");
  if (!startRaw || !endRaw) return value;

  const start = parseTime(startRaw);
  const end = parseTime(endRaw);
  if (!start || !end) return value;
  return `${start} – ${end}`;
}

function parseTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:${String(minute).padStart(2, "0")} ${suffix}`;
  }
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatCheckInTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
