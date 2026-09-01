"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  List,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AgendaList } from "@/components/schedule/AgendaList";
import { ClassDetailPanel } from "@/components/schedule/ClassDetailPanel";
import { TimeGrid } from "@/components/schedule/TimeGrid";
import { Button } from "@/components/ui/Button";
import { listClassSessions } from "@/lib/api/schedule";
import {
  addDays,
  capacityState,
  classTypeStyles,
  classTypesInUse,
  coachesInUse,
  formatDayRange,
  formatWeekRange,
  inferClassType,
  isSameDay,
  startOfWeek,
  visibleHourRange,
  WEEK_MAX_LANES,
} from "@/lib/schedule/format";
import type { ClassSession, ClassType } from "@/lib/types/schedule";

type CalendarView = "day" | "week" | "agenda";

const VIEW_OPTIONS: { value: CalendarView; label: string; icon: typeof CalendarDays }[] = [
  { value: "day", label: "Day", icon: CalendarDays },
  { value: "week", label: "Week", icon: CalendarRange },
  { value: "agenda", label: "Agenda", icon: List },
];

function defaultAnchor(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function rangeIso(date: Date, endOfDay = false): string {
  const next = new Date(date);
  next.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, 0);
  return next.toISOString();
}

export function ScheduleCalendar() {
  const router = useRouter();
  const [anchor, setAnchor] = useState<Date>(defaultAnchor);
  const [view, setView] = useState<CalendarView>("week");
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [coachFilter, setCoachFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<Set<ClassType>>(new Set());
  const [fullDay, setFullDay] = useState(false);

  const days = useMemo(() => {
    if (view === "day") return [anchor];
    const weekStart = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [view, anchor]);

  const rangeFrom = rangeIso(days[0]);
  const rangeTo = rangeIso(days[days.length - 1], true);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await listClassSessions(rangeFrom, rangeTo);
      setSessions(loaded);
    } catch {
      setError("Unable to load the class schedule.");
    } finally {
      setIsLoading(false);
    }
  }, [rangeFrom, rangeTo]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const coaches = useMemo(() => coachesInUse(sessions), [sessions]);
  const types = useMemo(() => classTypesInUse(sessions), [sessions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (coachFilter !== "all" && session.coachName !== coachFilter) return false;
      if (typeFilter.size > 0 && !typeFilter.has(inferClassType(session.name))) return false;
      if (!needle) return true;
      return (
        session.name.toLowerCase().includes(needle) ||
        (session.coachName ?? "").toLowerCase().includes(needle)
      );
    });
  }, [sessions, query, coachFilter, typeFilter]);

  const { startHour, endHour } = useMemo(
    () => visibleHourRange(filtered, fullDay),
    [filtered, fullDay],
  );

  const stats = useMemo(() => {
    let booked = 0;
    let capacity = 0;
    let full = 0;
    for (const session of filtered) {
      booked += session.bookedCount;
      capacity += session.capacity;
      const state = capacityState(session);
      if (state === "full" || state === "waitlist") full += 1;
    }
    return { total: filtered.length, booked, capacity, full };
  }, [filtered]);

  const selected = filtered.find((session) => session.id === selectedId) ?? null;
  const step = view === "day" ? 1 : 7;
  const hasFilters = query.trim() !== "" || coachFilter !== "all" || typeFilter.size > 0;
  const isCurrentPeriod = days.some((day) => isSameDay(day, new Date()));

  const toggleType = useCallback((type: ClassType) => {
    setTypeFilter((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setCoachFilter("all");
    setTypeFilter(new Set());
  }, []);

  const expandDay = useCallback((day: Date) => {
    setAnchor(day);
    setView("day");
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAnchor(addDays(anchor, -step))}
              className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 text-slate-500 hover:bg-neutral-50 hover:text-slate-900"
              aria-label={view === "day" ? "Previous day" : "Previous week"}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setAnchor(addDays(anchor, step))}
              className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 text-slate-500 hover:bg-neutral-50 hover:text-slate-900"
              aria-label={view === "day" ? "Next day" : "Next week"}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <h2 className="text-[17px] font-bold text-slate-900">
            {view === "day" ? formatDayRange(anchor) : formatWeekRange(days[0])}
          </h2>

          <button
            type="button"
            onClick={() => setAnchor(defaultAnchor())}
            disabled={isCurrentPeriod}
            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-neutral-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
                  view === option.value
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                <option.icon className="size-3.5" />
                {option.label}
              </button>
            ))}
          </div>
          <Button type="button" onClick={() => router.push("/schedule/new")}>
            <Plus className="size-4" />
            Create Class
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search classes or coaches"
            className="h-8 w-56 rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {coaches.length > 1 ? (
          <select
            value={coachFilter}
            onChange={(event) => setCoachFilter(event.target.value)}
            className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-[13px] font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All coaches</option>
            {coaches.map((coach) => (
              <option key={coach} value={coach}>
                {coach}
              </option>
            ))}
          </select>
        ) : null}

        {types.length > 1
          ? types.map((type) => {
              const styles = classTypeStyles(type);
              const active = typeFilter.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={clsx(
                    "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-all",
                    styles.surface,
                    styles.border,
                    active
                      ? clsx(styles.title, "ring-2 ring-slate-900 ring-offset-1 shadow-sm")
                      : clsx(styles.title, "opacity-90 hover:opacity-100"),
                  )}
                >
                  <span className={clsx("size-2.5 shrink-0 rounded-full", styles.dot)} />
                  {styles.label}
                </button>
              );
            })
          : null}

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold text-slate-500 hover:text-slate-900"
          >
            <X className="size-3.5" />
            Clear
          </button>
        ) : null}

        <div className="ml-auto flex items-center gap-3 text-[12px] text-slate-500">
          <span>
            <strong className="font-bold text-slate-800">{stats.total}</strong> classes
          </span>
          <span>
            <strong className="font-bold text-slate-800">{stats.booked}</strong>/{stats.capacity}{" "}
            booked
          </span>
          {stats.full > 0 ? (
            <span className="font-semibold text-rose-600">{stats.full} at capacity</span>
          ) : null}
          {view !== "agenda" ? (
            <label className="flex cursor-pointer items-center gap-1.5 font-medium">
              <input
                type="checkbox"
                checked={fullDay}
                onChange={(event) => setFullDay(event.target.checked)}
                className="size-3.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              Full day
            </label>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={clearFilters}
            onCreate={() => router.push("/schedule/new")}
          />
        ) : view === "agenda" ? (
          <div className="max-h-[calc(100vh-320px)] min-h-[420px] overflow-y-auto">
            <AgendaList
              days={days}
              sessions={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        ) : (
          <div className="max-h-[calc(100vh-320px)] min-h-[420px] overflow-auto [scrollbar-gutter:stable]">
            <TimeGrid
              days={days}
              sessions={filtered}
              startHour={startHour}
              endHour={endHour}
              maxLanes={view === "day" ? 8 : WEEK_MAX_LANES}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onExpandDay={expandDay}
            />
          </div>
        )}

        {selected ? (
          <div className="absolute inset-y-0 right-0 z-40 w-[360px] max-w-full border-l border-neutral-200 bg-white shadow-2xl">
            <ClassDetailPanel
              key={selected.id}
              session={selected}
              onClose={() => setSelectedId(null)}
              onSessionChanged={(updated) => {
                setSessions((current) =>
                  current.map((session) =>
                    session.id === updated.id ? { ...session, ...updated } : session,
                  ),
                );
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-neutral-100">
        <CalendarRange className="size-5 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {hasFilters ? "No classes match these filters" : "No classes scheduled"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {hasFilters
            ? "Try widening your search or clearing the filters."
            : "Create a class template to start filling this week."}
        </p>
      </div>
      {hasFilters ? (
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button type="button" onClick={onCreate}>
          <Plus className="size-4" />
          Create Class
        </Button>
      )}
    </div>
  );
}
