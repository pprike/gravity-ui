"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  listClassSessionAttendance,
  markClassAttendance,
} from "@/lib/api/attendance";
import { ApiClientError } from "@/lib/api/client";
import { getClassSession, listClassRoster } from "@/lib/api/schedule";
import { formatSessionDateTime } from "@/lib/schedule/format";
import type {
  ClassAttendanceEntry,
  ClassAttendanceStatus,
} from "@/lib/types/attendance";
import type { ClassRosterEntry, ClassSession } from "@/lib/types/schedule";

interface ClassRosterViewProps {
  sessionId: string;
}

function statusPill(status: string) {
  if (status === "waitlisted") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function statusLabel(status: string) {
  if (status === "waitlisted") return "Waitlisted";
  return "Confirmed";
}

function formatBookedAt(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ATTENDANCE_OPTIONS: Array<{ status: ClassAttendanceStatus; label: string }> = [
  { status: "attended", label: "Present" },
  { status: "late", label: "Late" },
  { status: "no_show", label: "No show" },
];

function attendanceLabel(status: ClassAttendanceStatus): string {
  return ATTENDANCE_OPTIONS.find((option) => option.status === status)?.label ?? status;
}

function toCsv(rows: ClassRosterEntry[]): string {
  const header = ["#", "Member Name", "Email", "Membership Plan", "Status", "Booked Time"];
  const body = rows.map((row, index) =>
    [
      index + 1,
      row.displayName,
      row.email,
      row.planName ?? "",
      statusLabel(row.bookingStatus),
      formatBookedAt(row.bookedAt),
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );
  return [header.join(","), ...body].join("\n");
}

export function ClassRosterView({ sessionId }: ClassRosterViewProps) {
  const router = useRouter();
  const [session, setSession] = useState<ClassSession | null>(null);
  const [roster, setRoster] = useState<ClassRosterEntry[]>([]);
  const [attendance, setAttendance] = useState<ClassAttendanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingUserId, setMarkingUserId] = useState<string | null>(null);
  const [attendanceFeedback, setAttendanceFeedback] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [loadedSession, loadedRoster, loadedAttendance] = await Promise.all([
          getClassSession(sessionId),
          listClassRoster(sessionId),
          listClassSessionAttendance(sessionId),
        ]);
        if (cancelled) return;
        setSession(loadedSession);
        setRoster(loadedRoster);
        setAttendance(loadedAttendance);
      } catch {
        if (!cancelled) setError("Unable to load class roster.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const attendanceByUser = useMemo(() => {
    const map = new Map<string, ClassAttendanceEntry>();
    for (const entry of attendance) {
      map.set(entry.userId, entry);
    }
    return map;
  }, [attendance]);

  const handleMarkAttendance = useCallback(
    async (userId: string, status: ClassAttendanceStatus, displayName: string) => {
      setMarkingUserId(userId);
      setAttendanceError(null);
      setAttendanceFeedback(null);
      try {
        const entry = await markClassAttendance(sessionId, { userId, status });
        setAttendance((current) => {
          const next = current.filter((row) => row.userId !== userId);
          return [...next, entry];
        });
        setAttendanceFeedback(
          `${displayName} marked ${attendanceLabel(status).toLowerCase()}. Attendance was recorded in the audit log.`,
        );
      } catch (err) {
        setAttendanceError(
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Unable to mark attendance.",
        );
      } finally {
        setMarkingUserId(null);
      }
    },
    [sessionId],
  );

  const confirmed = useMemo(
    () => roster.filter((row) => row.bookingStatus !== "waitlisted"),
    [roster],
  );
  const waitlist = useMemo(
    () => roster.filter((row) => row.bookingStatus === "waitlisted"),
    [roster],
  );

  function downloadCsv() {
    const blob = new Blob([toCsv(roster)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${session?.name ?? "class"}-roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50">
        <p className="text-sm text-danger-700">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => router.push("/schedule")}
          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          ← Back to schedule
        </button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={downloadCsv}>
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print Roster
          </Button>
        </div>
      </div>

      {session ? (
        <div className="grid gap-4 rounded-xl border border-neutral-200 bg-white px-5 py-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Coach
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {session.coachName ?? "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Time
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatSessionDateTime(session.startsAt, session.endsAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Location
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {session.locationName ?? "TBD"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Roster Size
            </p>
            <p className="mt-1 text-sm font-semibold text-primary-700">
              {confirmed.length} / {session.capacity} Confirmed
            </p>
          </div>
        </div>
      ) : null}

      {attendanceFeedback ? (
        <Card className="border-emerald-200 bg-emerald-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-800">{attendanceFeedback}</p>
          </div>
        </Card>
      ) : null}

      {attendanceError ? (
        <Card className="border-danger-200 bg-danger-50 p-4">
          <p className="text-sm text-danger-700">{attendanceError}</p>
        </Card>
      ) : null}

      <RosterTable
        title={`Confirmed Attendees (${confirmed.length})`}
        rows={confirmed}
        attendanceByUser={attendanceByUser}
        markingUserId={markingUserId}
        onMarkAttendance={handleMarkAttendance}
      />
      {waitlist.length > 0 ? (
        <RosterTable
          title={`Active Waitlist (${waitlist.length})`}
          rows={waitlist}
          waitlist
        />
      ) : null}
    </div>
  );
}

function RosterTable({
  title,
  rows,
  waitlist = false,
  attendanceByUser,
  markingUserId,
  onMarkAttendance,
}: {
  title: string;
  rows: ClassRosterEntry[];
  waitlist?: boolean;
  attendanceByUser?: Map<string, ClassAttendanceEntry>;
  markingUserId?: string | null;
  onMarkAttendance?: (
    userId: string,
    status: ClassAttendanceStatus,
    displayName: string,
  ) => void;
}) {
  const showAttendance = !waitlist && attendanceByUser && onMarkAttendance;

  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">No attendees yet.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Member Name</th>
              <th className="px-5 py-3">Membership Plan</th>
              <th className="px-5 py-3">Status</th>
              {showAttendance ? <th className="px-5 py-3">Attendance</th> : null}
              <th className="px-5 py-3">Booked Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const currentAttendance = attendanceByUser?.get(row.userId);
              const isMarking = markingUserId === row.userId;
              return (
                <tr key={row.bookingId} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {waitlist ? `W-${index + 1}` : index + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {row.displayName.charAt(0)}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {row.displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {row.planName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusPill(row.bookingStatus)}`}
                    >
                      {statusLabel(row.bookingStatus)}
                    </span>
                  </td>
                  {showAttendance ? (
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {ATTENDANCE_OPTIONS.map((option) => {
                          const isActive = currentAttendance?.status === option.status;
                          return (
                            <button
                              key={option.status}
                              type="button"
                              disabled={isMarking}
                              onClick={() =>
                                onMarkAttendance(row.userId, option.status, row.displayName)
                              }
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                isActive
                                  ? "border-primary-600 bg-primary-50 text-primary-700"
                                  : "border-neutral-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-700"
                              }`}
                            >
                              {isMarking && isActive ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                option.label
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  ) : null}
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {formatBookedAt(row.bookedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
