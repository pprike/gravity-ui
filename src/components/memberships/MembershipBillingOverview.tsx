"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { getBillingOverview } from "@/lib/api/membership-reporting";
import { formatCurrency } from "@/lib/dashboard/format";
import type { BillingOverview } from "@/lib/types/memberships";
import { Card } from "@/components/ui/Card";

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function transactionStatusLabel(status: string) {
  if (status === "succeeded") return "Paid";
  if (status === "failed") return "Failed";
  return "Pending";
}

function transactionStatusClass(status: string) {
  if (status === "succeeded") return "text-emerald-700";
  if (status === "failed") return "text-red-700";
  return "text-amber-700";
}

export function MembershipBillingOverview({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<BillingOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError("");
      try {
        const loaded = await getBillingOverview();
        if (!cancelled) setData(loaded);
      } catch {
        if (!cancelled) {
          setError("Unable to load billing overview.");
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-danger-200 bg-danger-50">
        <p className="text-sm text-danger-700">{error || "Billing overview unavailable."}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {embedded ? (
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Billing overview</h2>
          <p className="text-sm text-slate-500">Subscription health and recent payments</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{data.activeCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Past due / paused</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{data.pastDueCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="mt-2 text-3xl font-bold text-slate-700">{data.cancelledCount}</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Recent transactions</h3>
        </div>
        {data.recentTransactions.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Stripe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-5 py-3">
                      {transaction.userId ? (
                        <Link
                          href={`/members/${transaction.userId}`}
                          className="font-medium text-primary-700 hover:text-primary-800"
                        >
                          {transaction.memberName}
                        </Link>
                      ) : (
                        <span className="text-slate-700">{transaction.memberName}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{transaction.description}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {formatCurrency(transaction.amountCents, transaction.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-semibold ${transactionStatusClass(transaction.status)}`}
                      >
                        {transactionStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatTransactionDate(transaction.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      {transaction.stripeCustomerId ? (
                        <a
                          href={`https://dashboard.stripe.com/customers/${transaction.stripeCustomerId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                        >
                          View
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
