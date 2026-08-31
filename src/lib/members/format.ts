export function formatLastVisit(value: string | null | undefined): string {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const time = new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(date);

  if (date >= startOfToday) {
    return `Today, ${time}`;
  }
  if (date >= startOfYesterday) {
    return `Yesterday, ${time}`;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}
