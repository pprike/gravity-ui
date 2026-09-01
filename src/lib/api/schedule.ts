import { apiRequest } from "@/lib/api/client";
import { listLocations } from "@/lib/api/locations";
import { listStaff } from "@/lib/api/staff";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import { DEMO_COACHES, demoSchedule } from "@/lib/schedule/demo";
import type {
  ClassRosterEntry,
  ClassSession,
  ClassTemplate,
  CreateClassTemplatePayload,
  UpdateClassSessionPayload,
} from "@/lib/types/schedule";

function staffDisplayName(staff: {
  firstName: string;
  lastName: string;
}): string {
  return [staff.firstName, staff.lastName].filter(Boolean).join(" ");
}

async function enrichSessions(sessions: ClassSession[]): Promise<ClassSession[]> {
  const [locations, staff] = await Promise.all([
    listLocations().catch(() => []),
    listStaff().catch(() => []),
  ]);
  const locationNames = new Map(locations.map((location) => [location.id, location.name]));
  const coachNames = new Map(
    staff.map((member) => [member.id, staffDisplayName(member)]),
  );
  if (demoMembershipsEnabled()) {
    for (const coach of DEMO_COACHES) {
      if (!coachNames.has(coach.id)) coachNames.set(coach.id, coach.name);
    }
  }

  return sessions.map((session) => ({
    ...session,
    locationName: session.locationName ?? locationNames.get(session.locationId) ?? null,
    coachName: session.coachName ?? coachNames.get(session.coachUserId) ?? null,
  }));
}

export async function listClassSessions(
  from: string,
  to: string,
): Promise<ClassSession[]> {
  if (demoMembershipsEnabled()) {
    return demoSchedule.listSessions(from, to);
  }

  const params = new URLSearchParams({ from, to });
  const sessions = await apiRequest<ClassSession[]>(
    `/api/v1/class-sessions?${params.toString()}`,
  );
  return enrichSessions(sessions);
}

export async function getClassSession(
  sessionId: string,
): Promise<ClassSession | null> {
  if (demoMembershipsEnabled()) {
    return demoSchedule.getSession(sessionId) ?? null;
  }

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 60);
  const to = new Date(now);
  to.setDate(to.getDate() + 90);
  const sessions = await listClassSessions(from.toISOString(), to.toISOString());
  return sessions.find((session) => session.id === sessionId) ?? null;
}

export async function listClassRoster(
  sessionId: string,
): Promise<ClassRosterEntry[]> {
  if (demoMembershipsEnabled()) {
    return demoSchedule.listRoster(sessionId);
  }
  return apiRequest<ClassRosterEntry[]>(
    `/api/v1/class-sessions/${sessionId}/bookings`,
  );
}

export async function createClassTemplate(
  payload: CreateClassTemplatePayload,
): Promise<ClassTemplate> {
  if (demoMembershipsEnabled()) {
    return demoSchedule.createTemplate(payload);
  }
  return apiRequest<ClassTemplate>("/api/v1/class-templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listScheduleCoaches(): Array<{ id: string; name: string }> {
  return DEMO_COACHES.map((coach) => ({ id: coach.id, name: coach.name }));
}

export async function updateClassSession(
  sessionId: string,
  payload: UpdateClassSessionPayload,
): Promise<ClassSession> {
  if (demoMembershipsEnabled()) {
    return demoSchedule.updateSession(sessionId, payload);
  }

  const session = await apiRequest<ClassSession>(
    `/api/v1/class-sessions/${sessionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  const [enriched] = await enrichSessions([session]);
  return enriched;
}

export async function cancelClassSession(sessionId: string): Promise<ClassSession> {
  if (demoMembershipsEnabled()) {
    return demoSchedule.cancelSession(sessionId);
  }

  const session = await apiRequest<ClassSession>(
    `/api/v1/class-sessions/${sessionId}/cancel`,
    { method: "POST" },
  );
  const [enriched] = await enrichSessions([session]);
  return enriched;
}
