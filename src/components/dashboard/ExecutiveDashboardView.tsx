"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  LayoutDashboard,
  Loader2,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  checkInStatusTone,
  sessionStatusTone,
  StatusBadge,
} from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getExecutiveDashboard } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/auth/context";
import {
  formatCheckInTime,
  formatCurrency,
  formatDeltaPercent,
  formatSessionTimeRange,
} from "@/lib/dashboard/format";
import { canAccessRoute } from "@/lib/navigation/config";
import { useWorkspaceOptional } from "@/lib/shell/workspace-context";
import type { ExecutiveDashboard } from "@/lib/types/dashboard";

interface DashboardViewProps {
  firstName: string;
}

export function DashboardView({ firstName }: DashboardViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const workspace = useWorkspaceOptional();
  const locationId = workspace?.selectedLocationId;
  const locationName = workspace?.selectedLocation?.name;
  const roles = user?.roles ?? [];

  const canMembers = canAccessRoute(roles, "/members");
  const canSchedule = canAccessRoute(roles, "/schedule");
  const canAttendance = canAccessRoute(roles, "/attendance");
  const canReports = canAccessRoute(roles, "/reports");

  const [data, setData] = useState<ExecutiveDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loaded = await getExecutiveDashboard(locationId);
        if (!cancelled) setData(loaded);
      } catch {
        if (!cancelled) setError("Unable to load dashboard.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <LayoutDashboard className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Dashboard unavailable
        </h2>
        <p className="mt-2 max-w-md text-sm text-neutral-600">
          {error ?? "Try refreshing the page."}
        </p>
        <Button className="mt-6" type="button" onClick={() => router.refresh()}>
          Try again
        </Button>
      </div>
    );
  }

  const isEmpty =
    data.activeMemberships.count === 0 &&
    data.classOccupancy.sessionsToday === 0 &&
    data.revenue.mtdCents === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          firstName={firstName}
          locationName={locationName}
          canSchedule={canSchedule}
          canAttendance={canAttendance}
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Calendar className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Your dashboard is ready
          </h2>
          <p className="mt-2 max-w-md text-sm text-neutral-600">
            {canSchedule
              ? "Create membership plans and schedule classes to start seeing business metrics here."
              : "Metrics will appear here as members check in and classes run."}
          </p>
          {canSchedule ? (
            <Button
              className="mt-6"
              type="button"
              onClick={() => router.push("/schedule/new")}
            >
              Create Class
            </Button>
          ) : canAttendance ? (
            <Button
              className="mt-6"
              type="button"
              onClick={() => router.push("/attendance")}
            >
              Open check-in
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const revenueDelta = formatDeltaPercent(
    data.revenue.mtdCents,
    data.revenue.priorMtdCents,
  );
  const membershipDelta = formatDeltaPercent(
    data.activeMemberships.count,
    data.activeMemberships.priorCount,
  );
  const checkInDelta = formatDeltaPercent(
    data.checkInsToday.count,
    data.checkInsToday.priorDayCount,
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        firstName={firstName}
        locationName={locationName}
        canSchedule={canSchedule}
        canAttendance={canAttendance}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Members"
          value={String(data.activeMemberships.count)}
          delta={membershipDelta}
          footnote="vs start of month"
          href={canMembers ? "/members?status=active" : undefined}
          positive={
            data.activeMemberships.count >= data.activeMemberships.priorCount
          }
        />
        <KpiCard
          label="Today's Classes"
          value={String(data.classOccupancy.sessionsToday)}
          delta={`${data.classOccupancy.avgPercent}% avg fill`}
          footnote={`${data.classOccupancy.nearFullCount} near capacity`}
          href={canSchedule ? "/schedule" : undefined}
          positive
        />
        <KpiCard
          label="Check-ins Today"
          value={String(data.checkInsToday.count)}
          delta={checkInDelta}
          footnote="vs yesterday"
          href={canAttendance ? "/attendance" : undefined}
          positive={data.checkInsToday.count >= data.checkInsToday.priorDayCount}
        />
        {canReports ? (
          <KpiCard
            label="Revenue MTD"
            value={formatCurrency(data.revenue.mtdCents, data.revenue.currency)}
            delta={revenueDelta}
            footnote="vs same period last month"
            href="/reports"
            positive={data.revenue.mtdCents >= data.revenue.priorMtdCents}
          />
        ) : (
          <KpiCard
            label="Near capacity"
            value={String(data.classOccupancy.nearFullCount)}
            delta={`${data.classOccupancy.fullCount} full`}
            footnote="classes needing attention"
            href={canSchedule ? "/schedule" : undefined}
            positive={data.classOccupancy.fullCount === 0}
          />
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-0">
          <PanelHeader
            title="Live Attendance Log"
            href={canAttendance ? "/attendance" : undefined}
            live
          />
          <ul className="divide-y divide-neutral-100">
            {data.recentCheckIns.length === 0 ? (
              <li className="px-6 py-8 text-sm text-slate-500">
                No check-ins yet today.
              </li>
            ) : (
              data.recentCheckIns.map((entry) => {
                const name = (
                  <span className="text-sm font-semibold text-slate-900">
                    {entry.displayName}
                  </span>
                );
                return (
                  <li
                    key={`${entry.userId}-${entry.checkedInAt}`}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                        <UserRound className="size-5" />
                      </div>
                      <div>
                        {canMembers ? (
                          <Link
                            href={`/members/${entry.userId}`}
                            className="text-sm font-semibold text-slate-900 hover:text-primary-700"
                          >
                            {entry.displayName}
                          </Link>
                        ) : (
                          name
                        )}
                        <p className="text-xs text-slate-500">{entry.memberCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge
                        label={entry.status}
                        tone={checkInStatusTone(entry.status)}
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        {formatCheckInTime(entry.checkedInAt)}
                      </p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </Card>

        <Card className="p-0">
          <PanelHeader
            title="Classes Scheduled Today"
            href={canSchedule ? "/schedule" : undefined}
          />
          <ul className="divide-y divide-neutral-100">
            {data.todaySessions.length === 0 ? (
              <li className="px-6 py-8 text-sm text-slate-500">
                No classes scheduled today.
              </li>
            ) : (
              data.todaySessions.map((session) => (
                <li key={session.id} className="space-y-2 px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {canSchedule ? (
                        <Link
                          href={`/schedule/${session.id}/roster`}
                          className="text-sm font-semibold text-slate-900 hover:text-primary-700"
                        >
                          {session.name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-slate-900">
                          {session.name}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        {session.coachName ?? "Unassigned"}
                      </p>
                    </div>
                    <StatusBadge
                      label={session.status}
                      tone={sessionStatusTone(session.status)}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {formatSessionTimeRange(session.timeRange)}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {session.bookedCount}/{session.capacity}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {canReports ? (
        <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Monthly Revenue</p>
            <p className="mt-1 font-metric text-3xl font-semibold text-slate-900">
              {formatCurrency(data.revenue.mtdCents, data.revenue.currency)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-600">
              <ArrowUpRight className="size-4" />
              {revenueDelta} vs same period last month
            </p>
          </div>
          <Link href="/reports">
            <Button variant="secondary" type="button">
              <TrendingUp className="size-4" />
              View Reports
            </Button>
          </Link>
        </Card>
      ) : null}
    </div>
  );
}

function DashboardHeader({
  firstName,
  locationName,
  canSchedule,
  canAttendance,
}: {
  firstName: string;
  locationName?: string;
  canSchedule: boolean;
  canAttendance: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {locationName
            ? `Here is what is happening at ${locationName} today.`
            : "Here is what is happening at your studio today."}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {canSchedule ? (
          <Link href="/schedule">
            <Button variant="secondary" type="button">
              <Calendar className="size-4" />
              View Schedule
            </Button>
          </Link>
        ) : null}
        {canAttendance ? (
          <Link href="/attendance">
            <Button type="button">Quick Check-In</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function PanelHeader({
  title,
  href,
  live = false,
}: {
  title: string;
  href?: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4">
      <div className="flex items-center gap-2">
        {live ? (
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse-dot" />
        ) : null}
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          View All
        </Link>
      ) : null}
    </div>
  );
}

/** @deprecated Use DashboardView. Kept so existing imports continue to type-check. */
export function ExecutiveDashboardView(props: DashboardViewProps) {
  return <DashboardView {...props} />;
}
