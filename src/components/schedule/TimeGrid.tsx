"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { clsx } from "clsx";
import {
  capacityRatio,
  capacityState,
  capLanes,
  classTypeStyles,
  formatHourLabel,
  formatSessionStart,
  formatSessionTimeRange,
  HOUR_HEIGHT_PX,
  inferClassType,
  isToday,
  layoutSessions,
  MIN_EVENT_HEIGHT_PX,
  sessionsForDay,
  toIsoDate,
  WEEKDAY_LABELS,
  type LaneOverflow,
} from "@/lib/schedule/format";
import type { ClassSession } from "@/lib/types/schedule";

interface TimeGridProps {
  days: Date[];
  sessions: ClassSession[];
  startHour: number;
  endHour: number;
  maxLanes: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onExpandDay: (day: Date) => void;
}

function laneStyle(lane: number, laneSpan: number, laneCount: number): {
  left: string;
  width: string;
} {
  return {
    left: `calc(${(lane * 100) / laneCount}% + 3px)`,
    width: `calc(${(laneSpan * 100) / laneCount}% - 6px)`,
  };
}
function formatMinuteOfDay(minute: number): string {
  const hour = Math.floor(minute / 60);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(minute % 60).padStart(2, "0")} ${suffix}`;
}

function subscribeToMinute(onChange: () => void): () => void {
  const timer = setInterval(onChange, 15_000);
  return () => clearInterval(timer);
}

/** Epoch minute is stable within the minute, so React only re-renders on a tick. */
function readEpochMinute(): number {
  return Math.floor(Date.now() / 60_000);
}

/** The clock is an external source; SSR renders no marker to keep hydration clean. */
function useMinuteOfDay(): number | null {
  const epochMinute = useSyncExternalStore(subscribeToMinute, readEpochMinute, () => null);
  if (epochMinute === null) return null;
  const now = new Date(epochMinute * 60_000);
  return now.getHours() * 60 + now.getMinutes();
}

export function TimeGrid({
  days,
  sessions,
  startHour,
  endHour,
  maxLanes,
  selectedId,
  onSelect,
  onExpandDay,
}: TimeGridProps) {
  const minuteNow = useMinuteOfDay();

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index),
    [startHour, endHour],
  );
  const gridHeight = (endHour - startHour) * HOUR_HEIGHT_PX;
  const nowOffset =
    minuteNow === null ? -1 : (minuteNow - startHour * 60) * (HOUR_HEIGHT_PX / 60);
  const nowMarker =
    minuteNow !== null && nowOffset >= 0 && nowOffset <= gridHeight
      ? { offset: nowOffset, label: formatMinuteOfDay(minuteNow) }
      : null;

  return (
    <div className="flex min-w-[880px] flex-col">
      <div className="sticky top-0 z-20 flex border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="w-16 shrink-0" />
        {days.map((day) => (
          <DayHeader
            key={toIsoDate(day)}
            day={day}
            weekday={WEEKDAY_LABELS[(day.getDay() + 6) % 7]}
            count={sessionsForDay(sessions, day).length}
            compact={days.length > 1}
          />
        ))}
      </div>

      <div className="flex">
        <div className="relative w-16 shrink-0" style={{ height: gridHeight }}>
          {hours.map((hour) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-[11px] font-medium tabular-nums text-slate-400"
              style={{ top: (hour - startHour) * HOUR_HEIGHT_PX }}
            >
              {formatHourLabel(hour)}
            </span>
          ))}
          {nowMarker ? (
            <span
              className="absolute right-1 -translate-y-1/2 rounded bg-rose-500 px-1 py-px text-[10px] font-bold tabular-nums text-white"
              style={{ top: nowMarker.offset }}
            >
              {nowMarker.label}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1">
          {days.map((day) => (
            <DayColumn
              key={toIsoDate(day)}
              day={day}
              sessions={sessionsForDay(sessions, day)}
              startHour={startHour}
              gridHeight={gridHeight}
              maxLanes={maxLanes}
              selectedId={selectedId}
              nowOffset={nowMarker && isToday(day) ? nowMarker.offset : null}
              onSelect={onSelect}
              onExpandDay={onExpandDay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayHeader({
  day,
  weekday,
  count,
  compact,
}: {
  day: Date;
  weekday: string;
  count: number;
  compact: boolean;
}) {
  const today = isToday(day);
  return (
    <div
      className={clsx(
        "flex-1 border-l border-neutral-200 px-2 py-2.5 text-center",
        today && "bg-primary-50/60",
      )}
    >
      <p
        className={clsx(
          "text-[11px] font-semibold uppercase tracking-wider",
          today ? "text-primary-700" : "text-slate-400",
        )}
      >
        {compact ? weekday : day.toLocaleDateString("en-US", { weekday: "long" })}
      </p>
      <div className="mt-0.5 flex items-center justify-center gap-1.5">
        <span
          className={clsx(
            "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[13px] font-bold tabular-nums",
            today ? "bg-primary-600 text-white" : "text-slate-800",
          )}
        >
          {day.getDate()}
        </span>
        {count > 0 ? (
          <span className="text-[11px] font-medium text-slate-400">
            {count} {count === 1 ? "class" : "classes"}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DayColumn({
  day,
  sessions,
  startHour,
  gridHeight,
  maxLanes,
  selectedId,
  nowOffset,
  onSelect,
  onExpandDay,
}: {
  day: Date;
  sessions: ClassSession[];
  startHour: number;
  gridHeight: number;
  maxLanes: number;
  selectedId: string | null;
  nowOffset: number | null;
  onSelect: (id: string) => void;
  onExpandDay: (day: Date) => void;
}) {
  const { visible, overflow } = useMemo(
    () => capLanes(layoutSessions(sessions), maxLanes),
    [sessions, maxLanes],
  );
  const today = isToday(day);
  const weekend = day.getDay() === 0 || day.getDay() === 6;

  return (
    <div
      className={clsx(
        "relative flex-1 border-l border-neutral-200",
        today ? "bg-primary-50/30" : weekend ? "bg-slate-50/50" : "bg-white",
      )}
      style={{
        height: gridHeight,
        backgroundImage: `repeating-linear-gradient(to bottom, rgb(226 232 240 / 0.7) 0 1px, transparent 1px ${HOUR_HEIGHT_PX}px)`,
      }}
    >
      {visible.map((item) => (
        <ClassCard
          key={item.session.id}
          session={item.session}
          top={(item.startMinute - startHour * 60) * (HOUR_HEIGHT_PX / 60)}
          height={Math.max(
            MIN_EVENT_HEIGHT_PX,
            (item.endMinute - item.startMinute) * (HOUR_HEIGHT_PX / 60),
          )}
          lane={item.lane}
          laneSpan={item.laneSpan}
          laneCount={item.laneCount}
          isSelected={selectedId === item.session.id}
          onSelect={onSelect}
        />
      ))}

      {overflow.map((item) => (
        <OverflowChip
          key={item.key}
          item={item}
          day={day}
          startHour={startHour}
          onSelect={onSelect}
          onExpandDay={onExpandDay}
        />
      ))}

      {nowOffset !== null ? (
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
          style={{ top: nowOffset }}
        >
          <span className="size-2 shrink-0 rounded-full bg-rose-500" />
          <span className="h-px flex-1 bg-rose-500" />
        </div>
      ) : null}
    </div>
  );
}

function OverflowChip({
  item,
  day,
  startHour,
  onSelect,
  onExpandDay,
}: {
  item: LaneOverflow;
  day: Date;
  startHour: number;
  onSelect: (id: string) => void;
  onExpandDay: (day: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute right-1 z-20"
      style={{
        top: (item.startMinute - startHour * 60) * (HOUR_HEIGHT_PX / 60) + 4,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-6 min-w-6 items-center justify-center rounded-full border border-slate-300 bg-white px-1.5 text-[10px] font-bold text-slate-700 shadow-sm hover:border-primary-400 hover:text-primary-700"
      >
        +{item.sessions.length}
      </button>
      {open ? (
        <div className="absolute right-0 top-8 z-40 w-56 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-xl">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {item.sessions.length} more at this time
          </p>
          {item.sessions.map((session) => {
            const styles = classTypeStyles(inferClassType(session.name));
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSelect(session.id);
                }}
                className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-neutral-50"
              >
                <span className={clsx("mt-1 size-2 shrink-0 rounded-full", styles.dot)} />
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-slate-800">
                    {session.name}
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {formatSessionTimeRange(session.startsAt, session.endsAt)}
                    {session.coachName ? ` · ${session.coachName}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onExpandDay(day)}
            className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-[12px] font-semibold text-primary-700 hover:bg-primary-50"
          >
            Open day view
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ClassCard({
  session,
  top,
  height,
  lane,
  laneSpan,
  laneCount,
  isSelected,
  onSelect,
}: {
  session: ClassSession;
  top: number;
  height: number;
  lane: number;
  laneSpan: number;
  laneCount: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const styles = classTypeStyles(inferClassType(session.name));
  const state = capacityState(session);
  const cancelled = session.status === "cancelled";
  const compact = laneCount >= 2;
  const showMeta = height >= 40;
  const showCoach = height >= 68 && !compact;
  const showCapacity = height >= 54 && !compact;

  return (
    <button
      type="button"
      onClick={() => onSelect(session.id)}
      title={`${session.name} · ${formatSessionTimeRange(session.startsAt, session.endsAt)} · ${session.bookedCount}/${session.capacity}`}
      className={clsx(
        "group absolute flex flex-col overflow-hidden rounded-md border pl-2 pr-1.5 text-left transition-shadow",
        styles.surface,
        styles.border,
        cancelled && "opacity-60",
        isSelected
          ? "z-30 ring-2 ring-primary-500 ring-offset-1 shadow-lg"
          : "z-10 hover:z-20 hover:shadow-md",
        showMeta ? "py-1" : "py-0.5",
      )}
      style={{
        top,
        height,
        ...laneStyle(lane, laneSpan, laneCount),
      }}
    >
      <span className={clsx("absolute inset-y-0 left-0 w-1.5", styles.accent)} />

      <span
        className={clsx(
          "truncate text-[12px] font-semibold leading-4",
          styles.title,
          cancelled && "line-through",
        )}
      >
        {session.name}
      </span>

      {showMeta ? (
        <span className={clsx("truncate text-[11px] leading-4", styles.meta)}>
          {compact
            ? `${formatSessionStart(session.startsAt)} · ${session.bookedCount}/${session.capacity}`
            : formatSessionTimeRange(session.startsAt, session.endsAt)}
        </span>
      ) : null}

      {showCoach && session.coachName ? (
        <span className={clsx("truncate text-[11px] leading-4 opacity-80", styles.meta)}>
          {session.coachName}
        </span>
      ) : null}

      {showCapacity ? (
        <span className="mt-auto flex items-center gap-1.5">
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
            <span
              className={clsx(
                "block h-full rounded-full",
                state === "full" || state === "waitlist"
                  ? "bg-rose-500"
                  : state === "filling"
                    ? "bg-amber-500"
                    : styles.accent,
              )}
              style={{ width: `${capacityRatio(session) * 100}%` }}
            />
          </span>
          <span
            className={clsx(
              "shrink-0 text-[10px] font-bold tabular-nums",
              state === "full" || state === "waitlist" ? "text-rose-600" : styles.meta,
            )}
          >
            {session.bookedCount}/{session.capacity}
          </span>
        </span>
      ) : null}
    </button>
  );
}
