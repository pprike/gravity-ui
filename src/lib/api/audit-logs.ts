import { apiRequest } from "@/lib/api/client";
import { isDemoSession } from "@/lib/settings/demo";
import type { AuditLogPage } from "@/lib/types/audit";

const DEMO_LOGS: AuditLogPage = {
  items: [
    {
      id: "audit-1",
      userId: "demo-admin",
      action: "user.invite",
      resourceType: "user",
      resourceId: "demo-member-3",
      metadata: { email: "james.carter@work.com" },
      ipAddress: "127.0.0.1",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "audit-2",
      userId: "demo-admin",
      action: "membership.plan.update",
      resourceType: "membership_plan",
      resourceId: "plan-1",
      metadata: { name: "Premium Monthly" },
      ipAddress: "127.0.0.1",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "audit-3",
      userId: "demo-admin",
      action: "class.session.cancel",
      resourceType: "class_session",
      resourceId: "session-hiit-burn",
      metadata: null,
      ipAddress: "127.0.0.1",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  page: 0,
  size: 25,
  total: 3,
};

export async function listAuditLogs(params?: {
  action?: string;
  page?: number;
  size?: number;
}): Promise<AuditLogPage> {
  if (isDemoSession()) {
    const size = params?.size ?? 25;
    const page = params?.page ?? 0;
    let items = DEMO_LOGS.items;
    if (params?.action) {
      items = items.filter((entry) => entry.action.includes(params.action!));
    }
    const start = page * size;
    return {
      items: items.slice(start, start + size),
      page,
      size,
      total: items.length,
    };
  }

  const search = new URLSearchParams();
  if (params?.action) search.set("action", params.action);
  if (params?.page !== undefined) search.set("page", String(params.page));
  if (params?.size !== undefined) search.set("size", String(params.size));

  const query = search.toString();
  return apiRequest<AuditLogPage>(
    `/api/v1/audit-logs${query ? `?${query}` : ""}`,
  );
}
