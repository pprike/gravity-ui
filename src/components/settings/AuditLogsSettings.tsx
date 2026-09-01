"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ScrollText } from "lucide-react";
import { listAuditLogs } from "@/lib/api/audit-logs";
import { ApiClientError } from "@/lib/api/client";
import type { AuditLogEntry } from "@/lib/types/audit";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const PAGE_SIZE = 25;

function formatAction(action: string) {
  return action.replaceAll(".", " · ");
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AuditLogsSettings() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPage = useCallback(async (pageIndex: number) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await listAuditLogs({ page: pageIndex, size: PAGE_SIZE });
      setEntries(result.items);
      setTotal(result.total);
      setPage(result.page);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to load audit logs.",
      );
      setEntries([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const showingTo = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
        <ScrollText className="size-4 text-primary-600" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-slate-900">Audit log</h2>
          <p className="text-sm text-slate-500">
            Recent security-sensitive actions in your organization.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary-600" />
        </div>
      ) : error ? (
        <p className="px-5 py-8 text-sm text-danger-700" role="alert">
          {error}
        </p>
      ) : entries.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">No audit events yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Resource</th>
                  <th className="px-5 py-3">IP address</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-neutral-200 text-slate-700"
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      {formatTimestamp(entry.createdAt)}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {formatAction(entry.action)}
                    </td>
                    <td className="px-5 py-3">
                      {entry.resourceType}
                      {entry.resourceId ? ` · ${entry.resourceId}` : ""}
                    </td>
                    <td className="px-5 py-3">{entry.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {showingFrom}-{showingTo} of {total} events
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page === 0 || isLoading}
                onClick={() => void loadPage(page - 1)}
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={page + 1 >= totalPages || isLoading}
                onClick={() => void loadPage(page + 1)}
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
