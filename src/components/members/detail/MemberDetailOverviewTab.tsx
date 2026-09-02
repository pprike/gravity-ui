"use client";

import { Check, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { MemberDetailData } from "@/lib/types/member-detail";
import type { MemberSearchResult } from "@/lib/types/member";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MemberDetailOverviewTabProps {
  member: MemberSearchResult;
  detail: MemberDetailData;
}

export function MemberDetailOverviewTab({
  member,
  detail,
}: MemberDetailOverviewTabProps) {
  const planName = member.membershipPlanName ?? "No plan assigned";
  const planBilling =
    detail.overview.planPrice && detail.overview.planRenewal
      ? `${detail.overview.planPrice} • ${detail.overview.planRenewal}`
      : member.membershipStatus
        ? `Status: ${member.membershipStatus}`
        : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Membership Plan
            </h2>
          </div>
          <p className="text-lg font-bold text-primary-600">{planName}</p>
          {planBilling ? (
            <p className="mt-1 text-sm text-slate-500">{planBilling}</p>
          ) : null}
          {detail.overview.planFeatures.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {detail.overview.planFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <Check className="size-3.5 shrink-0 text-primary-600" />
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Weekly Consistency
          </h2>
          <div className="mt-4 flex justify-between gap-2">
            {WEEKDAYS.map((day, index) => {
              const attended = detail.overview.weeklyConsistency[index];
              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-2 text-xs text-slate-500"
                >
                  <span>{day}</span>
                  <div
                    className={`flex size-8 items-center justify-center rounded-full border ${
                      attended
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-neutral-200 bg-white text-slate-400"
                    }`}
                  >
                    {attended ? <Check className="size-3.5" /> : "–"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-slate-500">Classes This Month</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {detail.overview.classesThisMonth}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-slate-500">Total Gym Visits</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {detail.overview.totalVisits}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Upcoming Bookings
          </h2>
          {detail.overview.upcomingBookings.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No upcoming bookings.</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-100">
              {detail.overview.upcomingBookings.map((booking) => (
                <li key={`${booking.title}-${booking.subtitle}`}>
                  <Link
                    href="/schedule"
                    className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {booking.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {booking.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
