"use client";

import {
  ArrowUpRight,
  Calendar,
  Clock,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/context";

const KPI_CARDS = [
  {
    label: "Active Members",
    value: "847",
    delta: "+12%",
    footnote: "vs last month",
  },
  {
    label: "Today's Classes",
    value: "14",
    delta: "6 on schedule",
    footnote: "next starts 10:00 AM",
  },
  {
    label: "Check-ins Today",
    value: "203",
    delta: "+18%",
    footnote: "vs yesterday",
  },
  {
    label: "Revenue MTD",
    value: "$42,580",
    delta: "+8%",
    footnote: "vs monthly target",
  },
];

const LIVE_ATTENDANCE = [
  {
    name: "Alex Rivera",
    memberId: "#M-1042",
    time: "10:14 AM",
    status: "ACTIVE" as const,
  },
  {
    name: "Jordan Lee",
    memberId: "#M-0881",
    time: "10:08 AM",
    status: "ACTIVE" as const,
  },
  {
    name: "Sam Patel",
    memberId: "#M-1204",
    time: "9:55 AM",
    status: "PENDING RENEWAL" as const,
  },
  {
    name: "Taylor Brooks",
    memberId: "#M-0763",
    time: "9:41 AM",
    status: "ACTIVE" as const,
  },
];

const CLASSES_TODAY = [
  {
    name: "HIIT Strength",
    coach: "Coach Marcus",
    time: "10:00 – 11:00 AM",
    capacity: "18/20",
    status: "ALMOST FULL" as const,
  },
  {
    name: "Power Yoga",
    coach: "Coach Elena",
    time: "11:30 AM – 12:30 PM",
    capacity: "9/20",
    status: "OPEN" as const,
  },
  {
    name: "Spin Express",
    coach: "Coach Ryan",
    time: "12:45 – 1:30 PM",
    capacity: "20/20",
    status: "FULL" as const,
  },
];

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? "there";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is what&apos;s happening at Downtown location today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" type="button">
            <Calendar className="size-4" />
            View Schedule
          </Button>
          <Button type="button">+ Quick Check-In</Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((card) => (
          <Card key={card.label} padding="sm" className="p-6">
            <p className="text-sm text-slate-500">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                <TrendingUp className="size-3" />
                {card.delta}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">{card.footnote}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Live Attendance Log
              </h2>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View All
            </button>
          </div>
          <ul className="divide-y divide-neutral-100">
            {LIVE_ATTENDANCE.map((entry) => (
              <li
                key={entry.memberId}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {entry.name}
                    </p>
                    <p className="text-xs text-slate-500">{entry.memberId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge
                    label={entry.status}
                    tone={
                      entry.status === "ACTIVE" ? "success" : "warning"
                    }
                  />
                  <p className="mt-1 text-xs text-slate-400">{entry.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Classes Scheduled Today
            </h2>
            <button
              type="button"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Full Schedule
            </button>
          </div>
          <ul className="divide-y divide-neutral-100">
            {CLASSES_TODAY.map((session) => (
              <li key={session.name} className="space-y-2 px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {session.name}
                    </p>
                    <p className="text-xs text-slate-500">{session.coach}</p>
                  </div>
                  <StatusBadge
                    label={session.status}
                    tone={
                      session.status === "OPEN"
                        ? "success"
                        : session.status === "FULL"
                          ? "danger"
                          : "warning"
                    }
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {session.time}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {session.capacity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Monthly Revenue</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">$18,450</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-600">
            <ArrowUpRight className="size-4" />
            +8% vs last month
          </p>
        </div>
        <Button variant="secondary" type="button">
          View Reports
        </Button>
      </Card>
    </div>
  );
}
