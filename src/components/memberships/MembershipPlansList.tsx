"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Archive, Edit, Plus } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  deleteMembershipPlan,
  listMembershipPlans,
  updateMembershipPlan,
} from "@/lib/api/membership-plans";
import { getOrganization } from "@/lib/api/organization";
import { listLocations } from "@/lib/api/locations";
import {
  formatCredits,
  formatPlanInterval,
  formatPlanPrice,
} from "@/lib/memberships/format";
import type { MembershipPlan } from "@/lib/types/memberships";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlanStatusPill } from "@/components/memberships/PlanStatusPill";

const TABLE_COLUMNS =
  "grid grid-cols-[minmax(0,1fr)_120px_140px_140px_150px_120px_140px] items-center gap-4";

export function MembershipPlansList() {
  const router = useRouter();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [pageSubtitle, setPageSubtitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [plansData, org, locations] = await Promise.all([
          listMembershipPlans(),
          getOrganization().catch(() => null),
          listLocations().catch(() => []),
        ]);
        if (cancelled) return;
        setPlans(plansData);
        if (org) {
          const primaryLocation =
            locations.find((l) => l.status === "active") ?? locations[0];
          setPageSubtitle(
            primaryLocation
              ? `${org.name} • ${primaryLocation.name}`
              : org.name,
          );
        }
      } catch {
        if (!cancelled) setError("Unable to load membership plans.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleArchive(plan: MembershipPlan) {
    setArchivingId(plan.id);
    setError("");
    try {
      if (plan.status === "active") {
        await updateMembershipPlan(plan.id, {
          name: plan.name,
          description: plan.description ?? undefined,
          priceCents: plan.priceCents,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          classCredits: plan.classCredits,
          status: "inactive",
        });
        setPlans((prev) =>
          prev.map((p) =>
            p.id === plan.id ? { ...p, status: "inactive" } : p,
          ),
        );
      } else {
        await deleteMembershipPlan(plan.id);
        setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to archive plan.",
      );
    } finally {
      setArchivingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Membership Plans</h1>
          {pageSubtitle && (
            <p className="mt-1 text-sm text-slate-600">{pageSubtitle}</p>
          )}
        </div>
        <Button
          type="button"
          className="font-bold"
          onClick={() => router.push("/memberships/new")}
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {error && (
        <Card className="border-danger-200 bg-danger-50">
          <p className="text-sm text-danger-700">{error}</p>
        </Card>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div
          className={`${TABLE_COLUMNS} border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-600`}
        >
          <span>Plan Name</span>
          <span>Price</span>
          <span>Interval</span>
          <span>Credits</span>
          <span>Active Members</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {plans.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            No membership plans yet. Create your first plan to get started.
          </p>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`${TABLE_COLUMNS} border-b border-slate-200 px-6 py-4 last:border-b-0`}
            >
              <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
              <p className="text-sm font-medium text-slate-900">
                {formatPlanPrice(plan)}
              </p>
              <p className="text-sm text-slate-600">
                {formatPlanInterval(plan)}
              </p>
              <p className="text-sm text-slate-600">{formatCredits(plan)}</p>
              <p className="text-sm font-semibold text-teal-800">
                {plan.activeMemberCount ?? 0}
              </p>
              <div>
                <PlanStatusPill status={plan.status} />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/memberships/${plan.id}/edit`)}
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleArchive(plan)}
                  disabled={archivingId === plan.id}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50"
                >
                  <Archive className="h-3.5 w-3.5" />
                  {archivingId === plan.id ? "Archiving…" : "Archive"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
