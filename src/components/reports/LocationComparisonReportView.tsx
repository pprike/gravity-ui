"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/Card";
import { listLocations } from "@/lib/api/locations";
import { getLocationComparisonReport } from "@/lib/api/reports";
import { formatCurrency } from "@/lib/dashboard/format";
import type { LocationComparisonReport, RevenueDateRangePreset } from "@/lib/types/reports";
import type { Location } from "@/lib/types/settings";

const RANGE_OPTIONS: { value: RevenueDateRangePreset; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6mo", label: "Last 6 months" },
  { value: "ytd", label: "Year to date" },
];

export function LocationComparisonReportView({ embedded = false }: { embedded?: boolean }) {
  const [preset, setPreset] = useState<RevenueDateRangePreset>("30d");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [data, setData] = useState<LocationComparisonReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listLocations()
      .then((loaded) => {
        if (!cancelled) setLocations(loaded);
      })
      .catch(() => {
        if (!cancelled) setLocations([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loaded = await getLocationComparisonReport(
          preset,
          selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
        );
        if (!cancelled) setData(loaded);
      } catch {
        if (!cancelled) setError("Unable to load location comparison.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [preset, selectedLocationIds]);

  const maxCheckIns = useMemo(() => {
    if (!data?.locations.length) return 1;
    return Math.max(...data.locations.map((row) => row.checkIns), 1);
  }, [data]);

  const maxRevenue = useMemo(() => {
    if (!data?.locations.length) return 1;
    return Math.max(...data.locations.map((row) => row.revenueCents), 1);
  }, [data]);

  function toggleLocation(locationId: string) {
    setSelectedLocationIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId],
    );
  }

  const filters = (
    <div className="flex flex-col gap-3">
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
      {locations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {locations.map((location) => {
            const selected = selectedLocationIds.includes(location.id);
            return (
              <button
                key={location.id}
                type="button"
                onClick={() => toggleLocation(location.id)}
                className={clsx(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  selected
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-neutral-200 bg-white text-slate-600 hover:border-neutral-300",
                )}
              >
                {location.name}
              </button>
            );
          })}
          {selectedLocationIds.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedLocationIds([])}
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

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
            title="Locations"
            subtitle="Compare revenue, occupancy, and check-ins across studios."
          />
        ) : null}
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
          <Building2 className="mx-auto mb-4 size-8 text-primary-600" />
          <p className="text-sm text-neutral-600">{error ?? "Report unavailable."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {embedded ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Location comparison</h2>
            <p className="text-sm text-slate-500">
              Revenue, occupancy, and check-ins by studio
            </p>
          </div>
          {filters}
        </div>
      ) : (
        <PageHeader
          title="Locations"
          subtitle="Compare revenue, occupancy, and check-ins across studios."
          actions={filters}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(data.totalRevenueCents, data.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {data.from} to {data.to}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total check-ins</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.totalCheckIns}</p>
          <p className="mt-1 text-xs text-slate-400">Across selected locations</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Locations compared</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.locations.length}</p>
          <p className="mt-1 text-xs text-slate-400">Active studios in range</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900">Check-ins by location</h3>
          <div className="mt-6 space-y-4">
            {data.locations.map((row) => (
              <div key={row.locationId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{row.locationName}</span>
                  <span className="text-slate-500">{row.checkIns}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.max(4, (row.checkIns / maxCheckIns) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900">Attributed revenue</h3>
          <p className="mt-1 text-xs text-slate-500">
            Allocated by each location&apos;s share of check-ins
          </p>
          <div className="mt-6 space-y-4">
            {data.locations.map((row) => (
              <div key={row.locationId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{row.locationName}</span>
                  <span className="text-slate-500">
                    {formatCurrency(row.revenueCents, data.currency)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: `${Math.max(4, (row.revenueCents / maxRevenue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Location breakdown</h3>
        </div>
        {data.locations.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No locations to compare.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Revenue</th>
                <th className="px-5 py-3 font-semibold">Check-ins</th>
                <th className="px-5 py-3 font-semibold">Occupancy</th>
                <th className="px-5 py-3 font-semibold">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.locations.map((row) => (
                <tr key={row.locationId}>
                  <td className="px-5 py-3 font-medium text-slate-800">{row.locationName}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatCurrency(row.revenueCents, data.currency)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{row.checkIns}</td>
                  <td className="px-5 py-3 text-slate-600">{row.occupancyPercent}%</td>
                  <td className="px-5 py-3 text-slate-600">{row.sessionsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
