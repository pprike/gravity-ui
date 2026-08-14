"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Mail, MoreHorizontal, Pencil, Phone } from "lucide-react";
import { MemberDetailAttendanceTab } from "@/components/members/detail/MemberDetailAttendanceTab";
import { MemberDetailBookingsTab } from "@/components/members/detail/MemberDetailBookingsTab";
import { MemberDetailMembershipTab } from "@/components/members/detail/MemberDetailMembershipTab";
import { MemberDetailNotesTab } from "@/components/members/detail/MemberDetailNotesTab";
import { MemberDetailOverviewTab } from "@/components/members/detail/MemberDetailOverviewTab";
import { useMemberPageHeader } from "@/components/members/MemberPageHeaderContext";
import {
  displayStatus,
  MemberStatusPill,
} from "@/components/members/MemberStatusPill";
import {
  checkInMember,
  fetchMemberOverview,
} from "@/lib/api/member-detail";
import type {
  MemberDetailData,
  MemberDetailTab,
} from "@/lib/types/member-detail";
import type { MemberSearchResult } from "@/lib/types/member";

const TABS: Array<{ id: MemberDetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "attendance", label: "Attendance History" },
  { id: "membership", label: "Membership" },
  { id: "notes", label: "Notes" },
];

interface MemberDetailViewProps {
  member: MemberSearchResult;
  memberSince: string;
  userId: string;
}

export function MemberDetailView({
  member,
  memberSince,
  userId,
}: MemberDetailViewProps) {
  const { setHeader } = useMemberPageHeader();
  const [activeTab, setActiveTab] = useState<MemberDetailTab>("overview");
  const [notesCount, setNotesCount] = useState(0);
  const [overview, setOverview] = useState<MemberDetailData["overview"] | null>(
    null,
  );
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  const name = member.displayName ?? member.email;
  const status = displayStatus(member);

  useEffect(() => {
    setHeader({ title: name, subtitle: memberSince });
    return () => setHeader(null);
  }, [name, memberSince, setHeader]);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setOverviewLoading(true);
      try {
        const data = await fetchMemberOverview(
          userId,
          member.membershipPlanName,
        );
        if (!cancelled) setOverview(data);
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, [userId, member.membershipPlanName]);

  const handleCheckIn = useCallback(async () => {
    setCheckInLoading(true);
    try {
      await checkInMember(userId);
      setAttendanceRefreshKey((value) => value + 1);
      const data = await fetchMemberOverview(userId, member.membershipPlanName);
      setOverview(data);
    } finally {
      setCheckInLoading(false);
    }
  }, [userId, member.membershipPlanName]);

  const detail: MemberDetailData = {
    memberSince,
    overview:
      overview ?? {
        planPrice: "",
        planRenewal: "",
        planFeatures: [],
        classesThisMonth: 0,
        totalVisits: 0,
        weeklyConsistency: [false, false, false, false, false, false, false],
        upcomingBookings: [],
      },
    bookings: [],
    attendance: {
      totalVisits: 0,
      visitsThisMonth: 0,
      averagePerWeek: 0,
      longestStreakDays: 0,
      attendedDates: [],
      recentCheckIns: [],
    },
    membership: {
      planId: null,
      planName: member.membershipPlanName ?? "No plan assigned",
      priceLabel: "",
      renewalLabel: "",
      features: [],
      guestPassesRemaining: 0,
      guestPassesTotal: 0,
      lockerNumber: null,
      lockerActive: false,
      paymentMethod: null,
      billingHistory: [],
    },
    notes: [],
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatarUrl}
              alt=""
              className="size-[72px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-slate-200 text-2xl font-semibold text-slate-600">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
              <MemberStatusPill status={status} />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5 text-slate-400" />
                {member.email}
              </span>
              {member.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400" />
                  {member.phone}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleCheckIn()}
            disabled={checkInLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {checkInLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Check In
          </button>
          <Link
            href={`/members/${member.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="size-4" />
            Edit Profile
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-3 py-2.5 text-slate-600 hover:bg-slate-50"
            aria-label="More actions"
          >
            <MoreHorizontal className="size-[18px]" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-neutral-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const label =
            tab.id === "notes" && notesCount > 0
              ? `${tab.label} (${notesCount})`
              : tab.label;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" ? (
        overviewLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Loading overview…
          </div>
        ) : (
          <MemberDetailOverviewTab member={member} detail={detail} />
        )
      ) : null}
      {activeTab === "bookings" ? (
        <MemberDetailBookingsTab userId={userId} />
      ) : null}
      {activeTab === "attendance" ? (
        <MemberDetailAttendanceTab
          key={attendanceRefreshKey}
          userId={userId}
        />
      ) : null}
      {activeTab === "membership" ? (
        <MemberDetailMembershipTab userId={userId} />
      ) : null}
      {activeTab === "notes" ? (
        <MemberDetailNotesTab
          userId={userId}
          onNotesCountChange={setNotesCount}
        />
      ) : null}
    </div>
  );
}
