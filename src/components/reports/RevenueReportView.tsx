"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Loader2, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/Card";
import { getRevenueReport } from "@/lib/api/reports";
import { formatCurrency, formatDeltaPercent } from "@/lib/dashboard/format";
import type { RevenueDateRangePreset, RevenueReport } from "@/lib/types/reports";
import { clsx } from "clsx";

const RANGE_OPTIONS: { value: RevenueDateRangePreset; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6mo", label: "Last 6 months" },
  { value: "ytd", label: "Year to date" },
];

function formatMonthLabel(month: string) {
  const [year, monthNum] = month.split("-");
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

export function RevenueReportView() {
  const [preset, setPreset] = useState<RevenueDateRangePreset>("6mo");
  const [data, setData] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loaded = await getRevenueReport(preset);
        if (!cancelled) setData(loaded);
      } catch {
        if (!cancelled) setError("Unable to load revenue report.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [preset]);

  const maxTrendRevenue = useMemo(() => {
    if (!data?.monthlyTrend.length) return 1;
    return Math.max(...data.monthlyTrend.map((point) => point.revenueCents), 1);
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
        <PageHeader
          title="Revenue"
          subtitle="Track MRR, collected payments, and monthly trends."
        />
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
          <BarChart3 className="mx-auto mb-4 size-8 text-primary-600" />
          <p className="text-sm text-neutral-600">{error ?? "Report unavailable."}</p>
        </div>
      </div>
    );
  }

  const revenueDelta = formatDeltaPercent(data.mtdCents, data.priorMtdCents);
  const revenuePositive = data.mtdCents >= data.priorMtdCents;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        subtitle="Track MRR, collected payments, and monthly trends."
        actions={
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreset(option.value)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  preset === option.value
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="MRR"
          value={formatCurrency(data.mrrCents, data.currency)}
          delta="Active subs"
          footnote="Normalized monthly recurring revenue"
          href="/memberships"
          positive
        />
        <KpiCard
          label="Period revenue"
          value={formatCurrency(data.totalRevenueCents, data.currency)}
          delta={`${data.transactionCount} payments`}
          footnote="Succeeded payments in selected range"
          href="/reports"
          positive
        />
        <KpiCard
          label="Revenue MTD"
          value={formatCurrency(data.mtdCents, data.currency)}
          delta={revenueDelta}
          footnote="Month to date vs prior month"
          href="/reports"
          positive={revenuePositive}
        />
        <KpiCard
          label="Avg order value"
          value={formatCurrency(data.averageOrderValueCents, data.currency)}
          delta="Per payment"
          footnote="Total revenue divided by payment count"
          href="/reports"
          positive
        />
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Monthly revenue</h2>
            <p className="text-sm text-slate-500">Last six months of succeeded payments</p>
          </div>
          <TrendingUp className="size-5 text-primary-600" aria-hidden />
        </div>

        {data.monthlyTrend.length === 0 ? (
          <p className="text-sm text-slate-500">No payment data yet.</p>
        ) : (
          <div className="grid grid-cols-6 items-end gap-3 sm:gap-4">
            {data.monthlyTrend.map((point) => {
              const height = Math.max(8, (point.revenueCents / maxTrendRevenue) * 160);
              return (
                <div key={point.month} className="flex flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center">
                    <div
                      className="w-full max-w-12 rounded-t-md bg-primary-500/90"
                      style={{ height }}
                      title={formatCurrency(point.revenueCents, data.currency)}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700">
                      {formatMonthLabel(point.month)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatCurrency(point.revenueCents, data.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
