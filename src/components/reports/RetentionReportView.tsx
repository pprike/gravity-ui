"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Users } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/Card";
import { getRetentionReport } from "@/lib/api/reports";
import { formatDeltaPercent } from "@/lib/dashboard/format";
import type { RetentionReport } from "@/lib/types/reports";

function formatMonthLabel(month: string) {
  const [year, monthNum] = month.split("-");
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatCheckInDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function RetentionReportView({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<RetentionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loaded = await getRetentionReport();
        if (!cancelled) setData(loaded);
      } catch {
        if (!cancelled) setError("Unable to load retention report.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxEngagement = useMemo(() => {
    if (!data?.monthlyTrend.length) return 1;
    return Math.max(...data.monthlyTrend.map((point) => point.activeMembers), 1);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        {!embedded ? (
          <PageHeader
            title="Retention"
            subtitle="Track member engagement, cohort trends, and churn risk."
          />
        ) : null}
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
          <Users className="mx-auto mb-4 size-8 text-primary-600" />
          <p className="text-sm text-neutral-600">{error ?? "Report unavailable."}</p>
        </div>
      </div>
    );
  }

  const retentionDelta = formatDeltaPercent(
    data.activeMembers,
    data.priorActiveMembers,
  );
  const retentionPositive = data.activeMembers >= data.priorActiveMembers;

  return (
    <div className="space-y-6">
      {embedded ? (
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Retention metrics</h2>
          <p className="text-sm text-slate-500">
            Member engagement, cohort trends, and churn risk
          </p>
        </div>
      ) : (
        <PageHeader
          title="Retention"
          subtitle="Track member engagement, cohort trends, and churn risk."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active members"
          value={String(data.activeMembers)}
          delta={retentionDelta}
          footnote="Active subscriptions right now"
          href="/members"
          positive={retentionPositive}
        />
        <KpiCard
          label="Retention rate"
          value={`${data.retentionRatePercent}%`}
          delta="vs last month"
          footnote="Month-over-month active membership"
          href="/reports"
          positive={data.retentionRatePercent >= 90}
        />
        <KpiCard
          label="Churned this month"
          value={String(data.churnedThisMonth)}
          delta="Cancelled subs"
          footnote="Subscriptions cancelled in the current month"
          href="/memberships"
          positive={data.churnedThisMonth === 0}
        />
        <KpiCard
          label="At-risk members"
          value={String(data.atRiskMembers.length)}
          delta={`${data.inactiveDaysThreshold}+ days`}
          footnote="No recent check-ins despite active membership"
          href="/members"
          positive={data.atRiskMembers.length === 0}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-900">Monthly engagement</h2>
          <p className="mt-1 text-sm text-slate-500">
            Distinct members with at least one check-in per month
          </p>

          {data.monthlyTrend.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No check-in data yet.</p>
          ) : (
            <div className="mt-6 grid grid-cols-6 items-end gap-3">
              {data.monthlyTrend.map((point) => {
                const height = Math.max(8, (point.activeMembers / maxEngagement) * 140);
                return (
                  <div key={point.month} className="flex flex-col items-center gap-2">
                    <div className="flex h-36 w-full items-end justify-center">
                      <div
                        className="w-full max-w-10 rounded-t-md bg-emerald-500/90"
                        style={{ height }}
                        title={`${point.activeMembers} members`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700">
                        {formatMonthLabel(point.month)}
                      </p>
                      <p className="text-[11px] text-slate-500">{point.activeMembers}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
            <AlertTriangle className="size-4 text-amber-600" aria-hidden />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Churn warnings</h2>
              <p className="text-sm text-slate-500">
                Active members without a check-in in {data.inactiveDaysThreshold} days
              </p>
            </div>
          </div>

          {data.atRiskMembers.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">No at-risk members right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Member</th>
                    <th className="px-5 py-3 font-semibold">Last check-in</th>
                    <th className="px-5 py-3 font-semibold">Days inactive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {data.atRiskMembers.map((member) => (
                    <tr key={member.userId}>
                      <td className="px-5 py-3">
                        <Link
                          href={`/members/${member.userId}`}
                          className="font-medium text-primary-700 hover:text-primary-800"
                        >
                          {member.displayName}
                        </Link>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {formatCheckInDate(member.lastCheckInAt)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-amber-700">
                        {member.daysSinceCheckIn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Cohort retention</h2>
          <p className="text-sm text-slate-500">
            Percent of each join-month cohort still engaged month over month
          </p>
        </div>

        {data.cohorts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No cohort data yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Cohort</th>
                <th className="px-5 py-3 font-semibold">Size</th>
                {data.cohorts[0]?.retentionPercents.map((_, index) => (
                  <th key={index} className="px-5 py-3 font-semibold">
                    M{index}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.cohorts.map((cohort) => (
                <tr key={cohort.cohortMonth}>
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {formatMonthLabel(cohort.cohortMonth)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{cohort.memberCount}</td>
                  {cohort.retentionPercents.map((percent, index) => (
                    <td key={index} className="px-5 py-3">
                      <span
                        className={
                          percent >= 80
                            ? "font-semibold text-emerald-700"
                            : percent >= 60
                              ? "font-semibold text-amber-700"
                              : percent > 0
                                ? "font-semibold text-red-700"
                                : "text-slate-300"
                        }
                      >
                        {percent > 0 ? `${percent}%` : "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
