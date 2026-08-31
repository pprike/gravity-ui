"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { displayStatus, MemberStatusPill } from "@/components/members/MemberStatusPill";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { listMembershipPlans } from "@/lib/api/membership-plans";
import { searchMembers, updateMemberStatus } from "@/lib/api/members";
import { ApiClientError } from "@/lib/api/client";
import { formatLastVisit } from "@/lib/members/format";
import type {
  MemberSearchResult,
  PatchableMemberAccountStatus,
} from "@/lib/types/member";

const TABLE_HEAD_CELL =
  "px-5 py-3.5 align-middle text-xs font-semibold uppercase tracking-wide text-slate-500";
const TABLE_BODY_CELL = "px-5 py-3.5 align-middle text-sm";

type StatusFilter = "all" | "active" | "disabled" | "invited";

type StatusConfirmAction = {
  member: MemberSearchResult;
  nextStatus: PatchableMemberAccountStatus;
};

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Inactive" },
  { value: "invited", label: "Pending" },
];

function filterSelectClassName() {
  return "h-10 rounded-lg border border-neutral-200 bg-white px-3 pr-8 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberSearchResult[]>([]);
  const [planOptions, setPlanOptions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<StatusConfirmAction | null>(
    null,
  );
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const loadMembers = useCallback(async (query: string) => {
    try {
      const results = await searchMembers(
        query.length >= 2 ? query : undefined,
      );
      setMembers(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void listMembershipPlans()
      .then((plans) => {
        setPlanOptions(plans.map((plan) => plan.name).sort());
      })
      .catch(() => {
        setPlanOptions([]);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0 && searchQuery.length < 2) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsLoading(true);
      void loadMembers(searchQuery);
    }, searchQuery === "" ? 0 : 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, loadMembers]);

  const availablePlans = useMemo(() => {
    const fromMembers = members
      .map((member) => member.membershipPlanName)
      .filter((name): name is string => Boolean(name));
    return [...new Set([...planOptions, ...fromMembers])].sort();
  }, [members, planOptions]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (statusFilter !== "all" && member.status !== statusFilter) {
        return false;
      }

      if (planFilter === "none") {
        return !member.membershipPlanName;
      }

      if (planFilter !== "all" && member.membershipPlanName !== planFilter) {
        return false;
      }

      return true;
    });
  }, [members, planFilter, statusFilter]);

  const hasActiveFilters =
    searchQuery.length > 0 || statusFilter !== "all" || planFilter !== "all";

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setPlanFilter("all");
  }

  function requestStatusChange(
    member: MemberSearchResult,
    nextStatus: PatchableMemberAccountStatus,
  ) {
    if (member.status === nextStatus || statusUpdatingId === member.id) {
      return;
    }
    setStatusConfirm({ member, nextStatus });
  }

  async function handleConfirmStatusChange() {
    if (!statusConfirm) return;

    const { member, nextStatus } = statusConfirm;
    setActionError(null);
    setStatusUpdatingId(member.id);
    try {
      await updateMemberStatus(member.id, nextStatus);
      setMembers((current) =>
        current.map((entry) =>
          entry.id === member.id ? { ...entry, status: nextStatus } : entry,
        ),
      );
      setStatusConfirm(null);
    } catch (err) {
      setActionError(
        err instanceof ApiClientError
          ? err.message
          : nextStatus === "disabled"
            ? "Unable to disable member."
            : "Unable to enable member.",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  const emptyMessage = hasActiveFilters
    ? "No members match your filters."
    : "No members yet. Add your first member to get started.";

  const confirmMemberName =
    statusConfirm?.member.displayName ?? statusConfirm?.member.email ?? "member";
  const isDisabling = statusConfirm?.nextStatus === "disabled";

  return (
    <div className="flex flex-col gap-5">
      <ConfirmDialog
        open={statusConfirm !== null}
        title={isDisabling ? "Disable member?" : "Enable member?"}
        description={
          isDisabling
            ? `${confirmMemberName} will lose access to the member portal and will not be able to book classes or check in.`
            : `${confirmMemberName} will regain access to the member portal and can book classes and check in again.`
        }
        confirmLabel={isDisabling ? "Disable member" : "Enable member"}
        confirmVariant={isDisabling ? "destructive" : "primary"}
        isLoading={statusUpdatingId !== null}
        onConfirm={() => void handleConfirmStatusChange()}
        onCancel={() => {
          if (statusUpdatingId === null) {
            setStatusConfirm(null);
          }
        }}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 overflow-x-auto pb-0.5">
          <label className="flex h-10 w-[280px] shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search members, emails..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-label="Search members"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className={filterSelectClassName() + " shrink-0"}
            aria-label="Filter by status"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={planFilter}
            onChange={(event) => setPlanFilter(event.target.value)}
            className={filterSelectClassName() + " shrink-0"}
            aria-label="Filter by membership plan"
          >
            <option value="all">All plans</option>
            <option value="none">No plan</option>
            {availablePlans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="shrink-0 whitespace-nowrap text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            Reset Filters
          </button>
        </div>

        <Link
          href="/members/new"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 lg:self-auto"
        >
          <Plus className="size-4" />
          Add Member
        </Link>
      </div>

      {actionError && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse">
            <thead className="bg-slate-50">
              <tr className="border-b border-neutral-200">
                <th className={`${TABLE_HEAD_CELL} text-left`}>
                  <span className="inline-flex items-center gap-1.5">
                    Name
                    <ArrowUp className="size-2.5 text-primary-600" />
                  </span>
                </th>
                <th className={`${TABLE_HEAD_CELL} text-left`}>Email Address</th>
                <th className={`${TABLE_HEAD_CELL} text-left`}>Membership Plan</th>
                <th className={`${TABLE_HEAD_CELL} text-center`}>Status</th>
                <th className={`${TABLE_HEAD_CELL} text-left`}>Last Visit</th>
                <th className={`${TABLE_HEAD_CELL} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-sm text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Loading members…
                    </span>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-sm text-danger-600"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && filteredMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-sm text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                filteredMembers.map((member) => {
                  const name = member.displayName ?? member.email;
                  const status = displayStatus(member);
                  const isUpdating = statusUpdatingId === member.id;
                  const isDisabled = member.status === "disabled";
                  const nextStatus: PatchableMemberAccountStatus = isDisabled
                    ? "active"
                    : "disabled";

                  return (
                    <tr
                      key={member.id}
                      className="border-b border-neutral-100 last:border-b-0 transition-colors hover:bg-slate-50/80"
                    >
                      <td className={`${TABLE_BODY_CELL} text-left`}>
                        <div className="flex min-w-0 items-center gap-3">
                          {member.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.avatarUrl}
                              alt=""
                              className="size-9 shrink-0 rounded-full object-cover ring-1 ring-neutral-200"
                            />
                          ) : (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 ring-1 ring-neutral-200">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <Link
                            href={`/members/${member.id}`}
                            className="truncate font-semibold text-slate-900 transition-colors hover:text-primary-600"
                          >
                            {name}
                          </Link>
                        </div>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-left`}>
                        <p className="truncate text-slate-600">{member.email}</p>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-left`}>
                        <p className="truncate font-medium text-slate-900">
                          {member.membershipPlanName ?? "—"}
                        </p>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-center`}>
                        <div className="flex justify-center">
                          <MemberStatusPill status={status} />
                        </div>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-left`}>
                        <p className="inline-flex min-w-0 items-center gap-1.5 text-slate-600">
                          <Clock className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {formatLastVisit(member.lastVisitAt)}
                          </span>
                        </p>
                      </td>
                      <td className={`${TABLE_BODY_CELL} text-right`}>
                        <div className="inline-flex items-center justify-end gap-0.5">
                          <Link
                            href={`/members/${member.id}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`View ${name}`}
                          >
                            <Eye className="size-4" />
                          </Link>
                          <Link
                            href={`/members/${member.id}/edit`}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
                            aria-label={`Edit ${name}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => requestStatusChange(member, nextStatus)}
                            disabled={isUpdating}
                            className={`inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              isDisabled
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-danger-600 hover:bg-danger-50"
                            }`}
                            aria-label={
                              isDisabled ? `Enable ${name}` : `Disable ${name}`
                            }
                          >
                            {isUpdating ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : isDisabled ? (
                              <UserCheck className="size-4" />
                            ) : (
                              <UserX className="size-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && !error && filteredMembers.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredMembers.length} member
            {filteredMembers.length === 1 ? "" : "s"}
            {hasActiveFilters && members.length !== filteredMembers.length
              ? ` (filtered from ${members.length})`
              : ""}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" type="button" disabled>
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <Button variant="secondary" type="button" disabled>
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
