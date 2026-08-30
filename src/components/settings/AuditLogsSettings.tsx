"use client";

import { useEffect, useState } from "react";
import { Loader2, ScrollText } from "lucide-react";
import { listAuditLogs } from "@/lib/api/audit-logs";
import { ApiClientError } from "@/lib/api/client";
import type { AuditLogEntry } from "@/lib/types/audit";
import { Card } from "@/components/ui/Card";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError("");
      try {
        const page = await listAuditLogs({ page: 0, size: 25 });
        if (!cancelled) {
          setEntries(page.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Unable to load audit logs.",
          );
          setEntries([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      )}
    </Card>
  );
}
