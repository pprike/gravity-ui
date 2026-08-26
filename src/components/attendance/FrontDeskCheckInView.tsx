"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  UserRound,
} from "lucide-react";
import {
  checkInStatusTone,
  StatusBadge,
} from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  fetchTodayCheckIns,
  manualCheckIn,
  membershipAlertMessage,
} from "@/lib/api/attendance";
import { ApiClientError } from "@/lib/api/client";
import { searchMembers } from "@/lib/api/members";
import { formatCheckInTime } from "@/lib/dashboard/format";
import type { FrontDeskCheckIn } from "@/lib/types/attendance";
import type { MemberSearchResult } from "@/lib/types/member";

const POLL_INTERVAL_MS = 30_000;

function sourceLabel(source: string): string {
  if (source === "qr") return "QR scan";
  if (source === "booking") return "Class booking";
  return "Manual";
}

export function FrontDeskCheckInView() {
  const [stream, setStream] = useState<FrontDeskCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberSearchResult | null>(
    null,
  );
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const loadStream = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    }
    try {
      const rows = await fetchTodayCheckIns();
      setStream(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load check-ins");
      setStream([]);
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      void loadStream();
    }, 0);
    const interval = setInterval(() => {
      void loadStream(true);
    }, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [loadStream]);

  useEffect(() => {
    if (searchQuery.length > 0 && searchQuery.length < 2) {
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMembers(
          searchQuery.length >= 2 ? searchQuery : undefined,
        );
        setSearchResults(results.slice(0, 8));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const pendingRenewalCount = useMemo(
    () => stream.filter((entry) => entry.membershipStatus !== "ACTIVE").length,
    [stream],
  );

  const visibleSearchResults = useMemo(() => {
    if (searchQuery.length > 0 && searchQuery.length < 2) {
      return [];
    }
    return searchResults;
  }, [searchQuery, searchResults]);

  async function handleManualCheckIn(member: MemberSearchResult) {
    setIsCheckingIn(true);
    setCheckInError(null);
    setCheckInSuccess(null);

    if (member.membershipStatus !== "active") {
      setCheckInError(
        `${member.displayName ?? member.email} has an inactive membership. Check-in was blocked.`,
      );
      setIsCheckingIn(false);
      return;
    }

    try {
      const entry = await manualCheckIn({ userId: member.id });
      setStream((current) => [entry, ...current]);
      setCheckInSuccess(`${entry.displayName} checked in successfully.`);
      setSelectedMember(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      setCheckInError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Check-in failed.",
      );
    } finally {
      setIsCheckingIn(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Front desk</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live check-in stream and manual overrides for members without QR.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void loadStream(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Today&apos;s check-ins
              </h2>
              <p className="text-xs text-slate-500">
                {stream.length} arrival{stream.length === 1 ? "" : "s"}
                {pendingRenewalCount > 0
                  ? ` · ${pendingRenewalCount} need membership review`
                  : ""}
              </p>
            </div>
            <UserCheck className="size-5 text-primary-600" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Loading check-ins…
            </div>
          ) : error ? (
            <div className="px-5 py-16 text-center text-sm text-red-600">
              {error}
            </div>
          ) : stream.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-slate-500">
              No check-ins yet today. Scan a QR code or record a manual check-in.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {stream.map((entry) => {
                const alert = membershipAlertMessage(entry.membershipStatus);
                return (
                  <li key={entry.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/members/${entry.userId}`}
                            className="truncate text-sm font-semibold text-slate-900 hover:text-primary-600"
                          >
                            {entry.displayName}
                          </Link>
                          <span className="text-xs text-slate-400">
                            {entry.memberCode}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatCheckInTime(entry.checkedInAt)}
                          {entry.locationName ? ` · ${entry.locationName}` : ""}
                          {` · ${sourceLabel(entry.source)}`}
                        </p>
                        {alert ? (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                            {alert}
                          </p>
                        ) : null}
                      </div>
                      <StatusBadge
                        label={entry.membershipStatus}
                        tone={checkInStatusTone(entry.membershipStatus)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-primary-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Manual check-in
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Search for a member and check them in when QR is unavailable.
          </p>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              label=""
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedMember(null);
                setCheckInError(null);
                setCheckInSuccess(null);
              }}
              placeholder="Search by name or email…"
              className="pl-9"
            />
          </div>

          {checkInSuccess ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {checkInSuccess}
            </div>
          ) : null}

          {checkInError ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {checkInError}
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {isSearching ? (
              <div className="flex items-center gap-2 px-1 py-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Searching members…
              </div>
            ) : visibleSearchResults.length === 0 ? (
              <p className="px-1 py-2 text-sm text-slate-500">
                {searchQuery.length >= 2
                  ? "No members match that search."
                  : "Type at least 2 characters to search."}
              </p>
            ) : (
              visibleSearchResults.map((member) => {
                const inactive = member.membershipStatus !== "active";
                const isSelected = selectedMember?.id === member.id;
                return (
                  <div
                    key={member.id}
                    className="rounded-lg border border-neutral-200 bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {member.displayName ?? member.email}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {member.membershipPlanName ?? "No plan"}
                          {inactive ? " · inactive" : ""}
                        </p>
                        {inactive ? (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                            Membership is not active. Resolve billing before
                            check-in.
                          </p>
                        ) : null}
                      </div>
                      <Button
                        className="px-3 py-2"
                        disabled={isCheckingIn}
                        onClick={() => {
                          setSelectedMember(member);
                          void handleManualCheckIn(member);
                        }}
                      >
                        {isCheckingIn && isSelected ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Check in"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
