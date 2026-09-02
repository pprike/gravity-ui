"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchMemberAttendance } from "@/lib/api/member-detail";
import type { MemberAttendanceSummary } from "@/lib/types/member-detail";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MemberDetailAttendanceTabProps {
  userId: string;
}

export function MemberDetailAttendanceTab({
  userId,
}: MemberDetailAttendanceTabProps) {
  const [month, setMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<MemberAttendanceSummary | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMemberAttendance(
          userId,
          month.getMonth() + 1,
          month.getFullYear(),
        );
        if (!cancelled) setAttendance(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load attendance",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, month]);

  const calendarDays = useMemo(() => {
    if (!attendance) return [];

    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const attended = new Set(attendance.attendedDates);

    const cells: Array<{ day: number | null; attended: boolean }> = [];
    for (let i = 0; i < firstDay; i += 1) {
      cells.push({ day: null, attended: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({ day, attended: attended.has(iso) });
    }
    return cells;
  }, [attendance, month]);

  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  }

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-danger-700" role="alert">
        {error}
      </p>
    );
  }

  if (isLoading || !attendance) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        Loading attendance…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Visits", value: attendance.totalVisits },
          { label: "This Month", value: attendance.visitsThisMonth },
          { label: "Avg per Week", value: attendance.averagePerWeek },
          {
            label: "Longest Streak",
            value: `${attendance.longestStreakDays} days`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Attendance</h2>
            <div className="flex items-center gap-2 text-slate-500">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="rounded p-1 hover:bg-slate-100"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-medium text-slate-700">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="rounded p-1 hover:bg-slate-100"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 font-medium">
                {day}
              </span>
            ))}
            {calendarDays.map((cell, index) => (
              <div
                key={`${cell.day ?? "blank"}-${index}`}
                className="flex min-h-10 flex-col items-center justify-center gap-1 py-1"
              >
                {cell.day ? (
                  <>
                    <span className="text-sm text-slate-700">{cell.day}</span>
                    {cell.attended ? (
                      <span className="size-1.5 rounded-full bg-primary-600" />
                    ) : (
                      <span className="size-1.5" />
                    )}
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Check-ins
          </h2>
          {attendance.recentCheckIns.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No check-ins recorded.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {attendance.recentCheckIns.map((checkIn) => (
                <li key={checkIn.id} className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {checkIn.checkedInAt}
                    </p>
                    <p className="text-xs text-slate-500">
                      {checkIn.locationName}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
