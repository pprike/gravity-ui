"use client";

import { clsx } from "clsx";
import { ChevronRight, Users } from "lucide-react";
import {
  capacityRatio,
  capacityState,
  classTypeStyles,
  formatDuration,
  formatSessionTimeRange,
  inferClassType,
  isToday,
  sessionsForDay,
  toIsoDate,
} from "@/lib/schedule/format";
import type { ClassSession } from "@/lib/types/schedule";

interface AgendaListProps {
  days: Date[];
  sessions: ClassSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AgendaList({ days, sessions, selectedId, onSelect }: AgendaListProps) {
  return (
    <div className="divide-y divide-neutral-200">
      {days.map((day) => {
        const daySessions = sessionsForDay(sessions, day);
        const today = isToday(day);

        return (
          <section key={toIsoDate(day)} className="flex gap-4 px-5 py-4">
            <div className="w-20 shrink-0 pt-1">
              <p
                className={clsx(
                  "text-[11px] font-semibold uppercase tracking-wider",
                  today ? "text-primary-700" : "text-slate-400",
                )}
              >
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p
                className={clsx(
                  "text-2xl font-bold tabular-nums",
                  today ? "text-primary-700" : "text-slate-800",
                )}
              >
                {day.getDate()}
              </p>
              <p className="text-[11px] text-slate-400">
                {day.toLocaleDateString("en-US", { month: "short" })}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              {daySessions.length === 0 ? (
                <p className="py-3 text-sm text-slate-400">No classes scheduled</p>
              ) : (
                <ul className="space-y-1.5">
                  {daySessions.map((session) => (
                    <AgendaRow
                      key={session.id}
                      session={session}
                      isSelected={selectedId === session.id}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function AgendaRow({
  session,
  isSelected,
  onSelect,
}: {
  session: ClassSession;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const styles = classTypeStyles(inferClassType(session.name));
  const state = capacityState(session);
  const cancelled = session.status === "cancelled";

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(session.id)}
        className={clsx(
          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
          isSelected
            ? "border-primary-400 bg-primary-50/60 ring-1 ring-primary-400"
            : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
        )}
      >
        <span className={clsx("h-9 w-1 shrink-0 rounded-full", styles.accent)} />

        <span className="w-32 shrink-0">
          <span className="block text-[13px] font-semibold tabular-nums text-slate-800">
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </span>
          <span className="block text-[11px] text-slate-400">
            {formatDuration(session.startsAt, session.endsAt)}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={clsx(
                "truncate text-sm font-semibold text-slate-900",
                cancelled && "text-slate-400 line-through",
              )}
            >
              {session.name}
            </span>
            <span
              className={clsx(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                styles.badge,
              )}
            >
              {styles.label}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-slate-500">
            {session.coachName ?? "Unassigned"}
            {session.locationName ? ` · ${session.locationName}` : ""}
          </span>
        </span>

        <span className="hidden w-36 shrink-0 sm:block">
          <span className="flex items-center justify-end gap-1.5 text-[12px] font-semibold tabular-nums text-slate-600">
            <Users className="size-3.5 text-slate-400" />
            {session.bookedCount}/{session.capacity}
            {(session.waitlistCount ?? 0) > 0 ? (
              <span className="text-amber-600">+{session.waitlistCount} wait</span>
            ) : null}
          </span>
          <span className="mt-1 block h-1 overflow-hidden rounded-full bg-neutral-100">
            <span
              className={clsx(
                "block h-full rounded-full",
                state === "full" || state === "waitlist"
                  ? "bg-rose-500"
                  : state === "filling"
                    ? "bg-amber-500"
                    : "bg-primary-500",
              )}
              style={{ width: `${capacityRatio(session) * 100}%` }}
            />
          </span>
        </span>

        <ChevronRight className="size-4 shrink-0 text-slate-300" />
      </button>
    </li>
  );
}
