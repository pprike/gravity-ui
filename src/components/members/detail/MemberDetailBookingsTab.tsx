"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Loader2, Plus } from "lucide-react";
import { BookingStatusPill } from "@/components/members/detail/MemberDetailBadges";
import { fetchMemberBookings } from "@/lib/api/member-detail";
import type { MemberBookingRow } from "@/lib/types/member-detail";

interface MemberDetailBookingsTabProps {
  userId: string;
}

export function MemberDetailBookingsTab({
  userId,
}: MemberDetailBookingsTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<MemberBookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const rows = await fetchMemberBookings(userId, {
          status: statusFilter,
        });
        if (!cancelled) setBookings(rows);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-slate-600"
          >
            <Calendar className="size-4 text-slate-400" />
            Aug 1 – Aug 31
            <ChevronDown className="size-3" />
          </button>
          <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-slate-600">
            Status:
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="size-4" />
          Book New Class
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[220px_minmax(0,1fr)_180px_140px] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Date & Time</span>
          <span>Class Name</span>
          <span>Coach</span>
          <span>Status</span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Loading bookings…
          </div>
        ) : bookings.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            No bookings match the selected filters.
          </p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-[220px_minmax(0,1fr)_180px_140px] items-center gap-4 border-t border-neutral-100 px-4 py-3"
            >
              <p className="text-sm font-semibold text-slate-900">
                {booking.startsAt}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {booking.className}
              </p>
              <p className="text-sm text-slate-600">{booking.coachName}</p>
              <BookingStatusPill status={booking.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
