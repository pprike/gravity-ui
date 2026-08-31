"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { listMemberSubscriptions } from "@/lib/api/membership-reporting";
import { listMembershipPlans } from "@/lib/api/membership-plans";
import type {
  MemberSubscriptionAssignment,
  MembershipPlan,
  SubscriptionStatus,
} from "@/lib/types/memberships";
import { Card } from "@/components/ui/Card";

const STATUS_OPTIONS: Array<{ value: SubscriptionStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function subscriptionStatusTone(status: SubscriptionStatus) {
  if (status === "active") return "text-emerald-700";
  if (status === "paused") return "text-amber-700";
  return "text-slate-500";
}

export function MembershipAssignmentsList({ embedded = false }: { embedded?: boolean }) {
  const [assignments, setAssignments] = useState<MemberSubscriptionAssignment[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void listMembershipPlans()
      .then((loaded) => {
        if (!cancelled) setPlans(loaded);
      })
      .catch(() => {
        if (!cancelled) setPlans([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError("");
      try {
        const loaded = await listMemberSubscriptions({
          planId: planFilter || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        if (!cancelled) setAssignments(loaded);
      } catch {
        if (!cancelled) {
          setError("Unable to load membership assignments.");
          setAssignments([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planFilter, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: assignments.length,
      active: assignments.filter((item) => item.status === "active").length,
    };
  }, [assignments]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {embedded ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
            <p className="text-sm text-slate-500">
              {summary.total} assignments · {summary.active} active
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">All plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === option.value
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <Card className="border-danger-200 bg-danger-50">
          <p className="text-sm text-danger-700">{error}</p>
        </Card>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Member</th>
              <th className="px-5 py-3 font-semibold">Plan</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Started</th>
              <th className="px-5 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  No membership assignments match these filters.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.subscriptionId}>
                  <td className="px-5 py-3">
                    <Link
                      href={`/members/${assignment.userId}`}
                      className="font-medium text-primary-700 hover:text-primary-800"
                    >
                      {assignment.memberName}
                    </Link>
                    <p className="text-xs text-slate-500">{assignment.memberEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{assignment.planName}</td>
                  <td className="px-5 py-3">
                    <span
                      className={clsx(
                        "text-xs font-semibold uppercase tracking-wide",
                        subscriptionStatusTone(assignment.status),
                      )}
                    >
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatDate(assignment.startedAt)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatDate(assignment.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
