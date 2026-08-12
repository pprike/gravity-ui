"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, CreditCard, Loader2 } from "lucide-react";
import { BillingStatusPill } from "@/components/members/detail/MemberDetailBadges";
import { fetchMemberMembership } from "@/lib/api/member-detail";
import type { MemberMembershipDetail } from "@/lib/types/member-detail";

interface MemberDetailMembershipTabProps {
  userId: string;
}

export function MemberDetailMembershipTab({
  userId,
}: MemberDetailMembershipTabProps) {
  const [membership, setMembership] = useState<MemberMembershipDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMemberMembership(userId);
        if (!cancelled) setMembership(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load membership",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        Loading membership…
      </div>
    );
  }

  if (error || !membership) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        {error ?? "No membership information available."}
      </p>
    );
  }

  const showCredits =
    membership.guestPassesTotal > 0 || membership.guestPassesRemaining > 0;
  const guestPassPercent =
    membership.guestPassesTotal > 0
      ? (membership.guestPassesRemaining / membership.guestPassesTotal) * 100
      : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Current Plan</h2>
          <p className="mt-2 text-xl font-bold text-primary-600">
            {membership.planName}
          </p>
          {membership.priceLabel && membership.renewalLabel ? (
            <p className="mt-1 text-sm text-slate-500">
              {membership.priceLabel} • {membership.renewalLabel}
            </p>
          ) : null}
          {membership.features.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {membership.features.map((feature) => (
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
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Change Plan
              <ChevronDown className="size-3.5" />
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Cancel Membership
            </button>
          </div>
        </div>

        {showCredits ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Add-ons</h2>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Class Credits Remaining</span>
                  <span className="font-semibold text-slate-900">
                    {membership.guestPassesRemaining} of{" "}
                    {membership.guestPassesTotal}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{ width: `${guestPassPercent}%` }}
                  />
                </div>
              </div>
              {membership.lockerActive && membership.lockerNumber ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Locker Rental</p>
                    <p className="text-sm font-semibold text-slate-900">
                      Locker #{membership.lockerNumber}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    Active
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Payment Method
          </h2>
          {membership.paymentMethod ? (
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {membership.paymentMethod.brand} ending in{" "}
                    {membership.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-slate-500">
                    {membership.paymentMethod.expiresLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Update
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No payment method on file.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Billing History
          </h2>
          {membership.billingHistory.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No billing history yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-neutral-100">
              <div className="grid grid-cols-[1fr_1.2fr_90px_80px] gap-3 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Date</span>
                <span>Description</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {membership.billingHistory.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-[1fr_1.2fr_90px_80px] items-center gap-3 border-t border-neutral-100 px-4 py-3 text-sm"
                >
                  <span className="text-slate-600">{invoice.date}</span>
                  <span className="font-medium text-slate-900">
                    {invoice.description}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {invoice.amount}
                  </span>
                  <BillingStatusPill status={invoice.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
