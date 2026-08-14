import type { ClassSession, ClassType } from "@/lib/types/schedule";

/** One pixel per minute keeps the timeline maths trivial. */
export const HOUR_HEIGHT_PX = 60;
export const MIN_EVENT_HEIGHT_PX = 30;
export const MINUTES_PER_DAY = 24 * 60;
export const DEFAULT_START_HOUR = 6;
export const DEFAULT_END_HOUR = 21;
/** Week columns are ~110px. Two lanes stay readable; the rest go behind "+N". */
export const WEEK_MAX_LANES = 2;

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function startOfWeek(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  next.setDate(next.getDate() + (day === 0 ? -6 : 1 - day));
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toIsoDate(a) === toIsoDate(b);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const year = weekEnd.getFullYear();
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${year}`;
  }
  return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${year}`;
}

export function formatDayRange(day: Date): string {
  return day.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Sessions arrive either as wall-clock strings (demo fixtures) or as offset-aware
 * ISO instants (API). Wall-clock values must be read in local time or classes
 * drift by the browser's UTC offset.
 */
export function parseSessionInstant(value: string): Date {
  const wall = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (wall) {
    return new Date(
      Number(wall[1]),
      Number(wall[2]) - 1,
      Number(wall[3]),
      Number(wall[4]),
      Number(wall[5]),
      Number(wall[6] ?? 0),
    );
  }
  return new Date(value);
}

export function sessionDateKey(value: string): string {
  return toIsoDate(parseSessionInstant(value));
}

export function minutesOfDay(value: string): number {
  const date = parseSessionInstant(value);
  return date.getHours() * 60 + date.getMinutes();
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatSessionTimeRange(startsAt: string, endsAt: string): string {
  return `${formatClock(parseSessionInstant(startsAt))} – ${formatClock(parseSessionInstant(endsAt))}`;
}

export function formatSessionStart(startsAt: string): string {
  return formatClock(parseSessionInstant(startsAt));
}

export function formatSessionDateTime(startsAt: string, endsAt: string): string {
  const weekday = parseSessionInstant(startsAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return `${weekday} • ${formatSessionTimeRange(startsAt, endsAt)}`;
}

export function formatHourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function formatDuration(startsAt: string, endsAt: string): string {
  const minutes = Math.max(
    0,
    Math.round(
      (parseSessionInstant(endsAt).getTime() - parseSessionInstant(startsAt).getTime()) / 60_000,
    ),
  );
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export function sessionsForDay(sessions: ClassSession[], day: Date): ClassSession[] {
  const key = toIsoDate(day);
  return sessions
    .filter((session) => sessionDateKey(session.startsAt) === key)
    .sort((a, b) => minutesOfDay(a.startsAt) - minutesOfDay(b.startsAt));
}

/**
 * Collapses the timeline to the hours that actually contain classes so a studio
 * running 6am–8pm never scrolls through an empty overnight block.
 */
export function visibleHourRange(
  sessions: ClassSession[],
  fullDay = false,
): { startHour: number; endHour: number } {
  if (fullDay) return { startHour: 0, endHour: 24 };
  if (sessions.length === 0) {
    return { startHour: DEFAULT_START_HOUR, endHour: DEFAULT_END_HOUR };
  }

  let earliest = MINUTES_PER_DAY;
  let latest = 0;
  for (const session of sessions) {
    const start = minutesOfDay(session.startsAt);
    const rawEnd = minutesOfDay(session.endsAt);
    const end = rawEnd <= start ? MINUTES_PER_DAY : rawEnd;
    earliest = Math.min(earliest, start);
    latest = Math.max(latest, end);
  }

  let startHour = Math.max(0, Math.floor(earliest / 60) - 1);
  let endHour = Math.min(24, Math.ceil(latest / 60) + 1);

  // Keep the grid from feeling cramped when only one or two classes exist.
  while (endHour - startHour < 8) {
    if (startHour > 0) startHour -= 1;
    else if (endHour < 24) endHour += 1;
    else break;
  }

  return { startHour, endHour };
}

export interface PositionedSession {
  session: ClassSession;
  startMinute: number;
  endMinute: number;
  lane: number;
  /** How many lanes this card may occupy, starting at `lane`. */
  laneSpan: number;
  laneCount: number;
  clusterIndex: number;
}

export interface LaneOverflow {
  key: string;
  clusterIndex: number;
  startMinute: number;
  endMinute: number;
  lane: number;
  laneCount: number;
  sessions: ClassSession[];
}

/**
 * Greedy interval packing: overlapping sessions are grouped into clusters, then
 * each cluster's members claim the leftmost lane that is already free. Every
 * member of a cluster shares the same lane count so columns line up.
 */
export function layoutSessions(sessions: ClassSession[]): PositionedSession[] {
  const items = sessions
    .map((session) => {
      const startMinute = minutesOfDay(session.startsAt);
      const rawEnd = minutesOfDay(session.endsAt);
      const endMinute = rawEnd <= startMinute ? MINUTES_PER_DAY : rawEnd;
      return { session, startMinute, endMinute };
    })
    .sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute);

  const positioned: PositionedSession[] = [];
  let cluster: PositionedSession[] = [];
  let clusterEnd = -1;
  let clusterIndex = 0;
  let laneEnds: number[] = [];

  const flush = () => {
    const count = Math.max(1, laneEnds.length);
    for (const item of cluster) {
      item.laneCount = count;
      item.laneSpan = spanFor(item, cluster, count);
    }
    positioned.push(...cluster);
    cluster = [];
    laneEnds = [];
  };

  for (const item of items) {
    if (cluster.length > 0 && item.startMinute >= clusterEnd) {
      flush();
      clusterIndex += 1;
      clusterEnd = -1;
    }

    let lane = laneEnds.findIndex((end) => end <= item.startMinute);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.endMinute);
    } else {
      laneEnds[lane] = item.endMinute;
    }

    cluster.push({ ...item, lane, laneSpan: 1, laneCount: 1, clusterIndex });
    clusterEnd = Math.max(clusterEnd, item.endMinute);
  }
  if (cluster.length > 0) flush();

  return positioned;
}

function spansOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Grow a card rightward through lanes that stay empty for its whole duration. */
function spanFor(
  item: PositionedSession,
  cluster: PositionedSession[],
  laneCount: number,
): number {
  let span = 1;
  for (let next = item.lane + 1; next < laneCount; next += 1) {
    const blocked = cluster.some(
      (other) =>
        other !== item &&
        other.lane === next &&
        spansOverlap(item.startMinute, item.endMinute, other.startMinute, other.endMinute),
    );
    if (blocked) break;
    span += 1;
  }
  return span;
}

/**
 * Caps how many lanes a narrow column renders, rolling the remainder into a
 * single "+N more" affordance rather than shaving cards down to slivers.
 */
export function capLanes(
  positioned: PositionedSession[],
  maxLanes: number,
): { visible: PositionedSession[]; overflow: LaneOverflow[] } {
  const visible: PositionedSession[] = [];
  const hiddenByCluster = new Map<number, PositionedSession[]>();

  for (const item of positioned) {
    if (item.lane < maxLanes) {
      const cappedCount = Math.min(item.laneCount, maxLanes);
      visible.push({
        ...item,
        laneCount: cappedCount,
        laneSpan: Math.min(item.laneSpan, cappedCount - item.lane),
      });
      continue;
    }
    const bucket = hiddenByCluster.get(item.clusterIndex) ?? [];
    bucket.push(item);
    hiddenByCluster.set(item.clusterIndex, bucket);
  }

  const overflow: LaneOverflow[] = [];
  for (const [clusterIndex, hidden] of hiddenByCluster) {
    overflow.push({
      key: `overflow-${clusterIndex}`,
      clusterIndex,
      startMinute: Math.min(...hidden.map((item) => item.startMinute)),
      endMinute: Math.max(...hidden.map((item) => item.endMinute)),
      lane: maxLanes - 1,
      laneCount: maxLanes,
      sessions: hidden.map((item) => item.session),
    });
  }

  return { visible, overflow };
}

export type CapacityState = "open" | "filling" | "full" | "waitlist";

export function capacityState(session: ClassSession): CapacityState {
  if ((session.waitlistCount ?? 0) > 0) return "waitlist";
  if (session.capacity > 0 && session.bookedCount >= session.capacity) return "full";
  if (session.capacity > 0 && session.bookedCount / session.capacity >= 0.8) return "filling";
  return "open";
}

export function capacityRatio(session: ClassSession): number {
  if (session.capacity <= 0) return 0;
  return Math.min(1, session.bookedCount / session.capacity);
}

export function inferClassType(name: string): ClassType {
  const value = name.toLowerCase();
  if (/(yoga|vinyasa|ashtanga|flow|mobility|stretch)/.test(value)) return "yoga";
  if (/(pilates|barre|reformer|core)/.test(value)) return "pilates";
  if (/(hiit|shred|burn|bootcamp|sweat)/.test(value)) return "hiit";
  if (/(cycle|spin|ride)/.test(value)) return "cycle";
  if (/(strength|lift|weight|power|barbell)/.test(value)) return "strength";
  if (/(condition|kettlebell|metcon|circuit|endurance)/.test(value)) return "conditioning";
  return "other";
}

export interface ClassTypeStyles {
  label: string;
  /** Left accent rail — carries the colour so card fills stay quiet. */
  accent: string;
  dot: string;
  surface: string;
  border: string;
  title: string;
  meta: string;
  badge: string;
}

const CLASS_TYPE_STYLES: Record<ClassType, ClassTypeStyles> = {
  yoga: {
    label: "Yoga",
    accent: "bg-violet-600",
    dot: "bg-violet-600",
    surface: "bg-violet-100 hover:bg-violet-200",
    border: "border-violet-300",
    title: "text-violet-950",
    meta: "text-violet-800",
    badge: "bg-violet-200 text-violet-900",
  },
  pilates: {
    label: "Pilates",
    accent: "bg-fuchsia-600",
    dot: "bg-fuchsia-600",
    surface: "bg-fuchsia-100 hover:bg-fuchsia-200",
    border: "border-fuchsia-300",
    title: "text-fuchsia-950",
    meta: "text-fuchsia-800",
    badge: "bg-fuchsia-200 text-fuchsia-900",
  },
  hiit: {
    label: "HIIT",
    accent: "bg-orange-600",
    dot: "bg-orange-600",
    surface: "bg-orange-100 hover:bg-orange-200",
    border: "border-orange-300",
    title: "text-orange-950",
    meta: "text-orange-800",
    badge: "bg-orange-200 text-orange-900",
  },
  strength: {
    label: "Strength",
    accent: "bg-blue-600",
    dot: "bg-blue-600",
    surface: "bg-blue-100 hover:bg-blue-200",
    border: "border-blue-300",
    title: "text-blue-950",
    meta: "text-blue-800",
    badge: "bg-blue-200 text-blue-900",
  },
  cycle: {
    label: "Cycle",
    accent: "bg-emerald-600",
    dot: "bg-emerald-600",
    surface: "bg-emerald-100 hover:bg-emerald-200",
    border: "border-emerald-300",
    title: "text-emerald-950",
    meta: "text-emerald-800",
    badge: "bg-emerald-200 text-emerald-900",
  },
  conditioning: {
    label: "Conditioning",
    accent: "bg-amber-600",
    dot: "bg-amber-600",
    surface: "bg-amber-100 hover:bg-amber-200",
    border: "border-amber-300",
    title: "text-amber-950",
    meta: "text-amber-900",
    badge: "bg-amber-200 text-amber-950",
  },
  other: {
    label: "Class",
    accent: "bg-slate-500",
    dot: "bg-slate-500",
    surface: "bg-slate-100 hover:bg-slate-200",
    border: "border-slate-300",
    title: "text-slate-900",
    meta: "text-slate-700",
    badge: "bg-slate-200 text-slate-800",
  },
};

export function classTypeStyles(type: ClassType): ClassTypeStyles {
  return CLASS_TYPE_STYLES[type] ?? CLASS_TYPE_STYLES.other;
}

export function classTypesInUse(sessions: ClassSession[]): ClassType[] {
  const seen = new Set<ClassType>();
  for (const session of sessions) seen.add(inferClassType(session.name));
  return [...seen].sort();
}

export function coachesInUse(sessions: ClassSession[]): string[] {
  const seen = new Set<string>();
  for (const session of sessions) {
    if (session.coachName) seen.add(session.coachName);
  }
  return [...seen].sort();
}
