import { apiRequest } from "@/lib/api/client";
import type { AuditLogPage } from "@/lib/types/audit";

export async function listAuditLogs(params?: {
  action?: string;
  page?: number;
  size?: number;
}): Promise<AuditLogPage> {
  const search = new URLSearchParams();
  if (params?.action) search.set("action", params.action);
  if (params?.page !== undefined) search.set("page", String(params.page));
  if (params?.size !== undefined) search.set("size", String(params.size));

  const query = search.toString();
  return apiRequest<AuditLogPage>(
    `/api/v1/audit-logs${query ? `?${query}` : ""}`,
  );
}
