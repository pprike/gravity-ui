"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getClassSession, listClassRoster } from "@/lib/api/schedule";
import { formatSessionDateTime } from "@/lib/schedule/format";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [loadedSession, loadedRoster] = await Promise.all([
          getClassSession(sessionId),
          listClassRoster(sessionId),
        ]);
        if (cancelled) return;
        setSession(loadedSession);
        setRoster(loadedRoster);
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

      <RosterTable title={`Confirmed Attendees (${confirmed.length})`} rows={confirmed} />
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
}: {
  title: string;
  rows: ClassRosterEntry[];
  waitlist?: boolean;
}) {
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
              <th className="px-5 py-3">Booked Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
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
                <td className="px-5 py-3.5 text-sm text-slate-600">
                  {formatBookedAt(row.bookedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
