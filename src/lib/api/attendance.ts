import { ApiClientError, apiRequest } from "@/lib/api/client";
import {
  demoFrontDeskCheckIns,
  demoListClassAttendance,
  demoMarkClassAttendance,
} from "@/lib/attendance/demo";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import type {
  ClassAttendanceEntry,
  FrontDeskCheckIn,
  ManualCheckInPayload,
  MarkClassAttendancePayload,
  QrCheckInPayload,
} from "@/lib/types/attendance";

interface FrontDeskCheckInApi {
  id: string;
  userId: string;
  displayName: string;
  memberCode: string;
  checkedInAt: string;
  locationName: string | null;
  membershipStatus: string;
  source: string;
}

function mapCheckIn(entry: FrontDeskCheckInApi): FrontDeskCheckIn {
  return {
    id: entry.id,
    userId: entry.userId,
    displayName: entry.displayName,
    memberCode: entry.memberCode,
    checkedInAt: entry.checkedInAt,
    locationName: entry.locationName,
    membershipStatus: entry.membershipStatus,
    source: entry.source,
  };
}

function demoMemberCode(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) % 10000;
  }
  return `#M-${String(Math.abs(hash)).padStart(4, "0")}`;
}

let demoStream = [...demoFrontDeskCheckIns];

export async function fetchTodayCheckIns(
  locationId?: string,
): Promise<FrontDeskCheckIn[]> {
  if (demoMembershipsEnabled()) {
    return [...demoStream].sort(
      (a, b) =>
        new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime(),
    );
  }

  const params = new URLSearchParams({ today: "true" });
  if (locationId) {
    params.set("locationId", locationId);
  }

  const rows = await apiRequest<FrontDeskCheckInApi[]>(
    `/api/v1/attendance?${params.toString()}`,
  );
  return rows.map(mapCheckIn);
}

export async function manualCheckIn(
  payload: ManualCheckInPayload,
): Promise<FrontDeskCheckIn> {
  if (demoMembershipsEnabled()) {
    const { searchMembers } = await import("@/lib/api/members");
    const members = await searchMembers();
    const member = members.find((row) => row.id === payload.userId);
    if (!member) {
      throw new ApiClientError("Member not found.", "NOT_FOUND", 404);
    }
    if (member.membershipStatus !== "active") {
      throw new ApiClientError(
        "Membership is not active.",
        "BOOKING_POLICY_VIOLATION",
        422,
      );
    }
    const alreadyCheckedIn = demoStream.some(
      (entry) =>
        entry.userId === payload.userId &&
        new Date(entry.checkedInAt).toDateString() ===
          new Date().toDateString(),
    );
    if (alreadyCheckedIn) {
      throw new ApiClientError(
        "Member has already checked in today.",
        "CONFLICT",
        409,
      );
    }

    const entry: FrontDeskCheckIn = {
      id: `checkin-${Date.now()}`,
      userId: member.id,
      displayName: member.displayName ?? member.email,
      memberCode: demoMemberCode(member.email),
      checkedInAt: new Date().toISOString(),
      locationName: "Main Studio",
      membershipStatus: "ACTIVE",
      source: "manual",
    };
    demoStream = [entry, ...demoStream];
    return entry;
  }

  const created = await apiRequest<FrontDeskCheckInApi>(
    "/api/v1/attendance/manual",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return mapCheckIn(created);
}

export function membershipAlertMessage(status: string): string | null {
  if (status === "ACTIVE") return null;
  return "Membership is inactive or pending renewal. Verify plan status before allowing entry.";
}

interface ClassAttendanceEntryApi {
  userId: string;
  status: string;
  markedAt: string;
  markedBy: string;
  markedByName: string | null;
}

function mapClassAttendance(entry: ClassAttendanceEntryApi): ClassAttendanceEntry {
  return {
    userId: entry.userId,
    status: entry.status as ClassAttendanceEntry["status"],
    markedAt: entry.markedAt,
    markedBy: entry.markedBy,
    markedByName: entry.markedByName,
  };
}

export async function listClassSessionAttendance(
  sessionId: string,
): Promise<ClassAttendanceEntry[]> {
  if (demoMembershipsEnabled()) {
    return demoListClassAttendance(sessionId);
  }
  const rows = await apiRequest<ClassAttendanceEntryApi[]>(
    `/api/v1/class-sessions/${sessionId}/attendance`,
  );
  return rows.map(mapClassAttendance);
}

export async function markClassAttendance(
  sessionId: string,
  payload: MarkClassAttendancePayload,
): Promise<ClassAttendanceEntry> {
  if (demoMembershipsEnabled()) {
    try {
      return demoMarkClassAttendance(sessionId, payload);
    } catch (err) {
      if (err instanceof Error && "status" in err && err.status === 409) {
        throw new ApiClientError(err.message, "CONFLICT", 409);
      }
      throw err;
    }
  }
  const created = await apiRequest<ClassAttendanceEntryApi>(
    `/api/v1/class-sessions/${sessionId}/attendance`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return mapClassAttendance(created);
}

export async function qrCheckIn(payload: QrCheckInPayload): Promise<FrontDeskCheckIn> {
  if (demoMembershipsEnabled()) {
    const token = payload.token.replace(/^gravity-checkin:/, "");
    if (!token || token.length < 8) {
      throw new ApiClientError(
        "QR code is invalid or has expired.",
        "NOT_FOUND",
        404,
      );
    }
    const { searchMembers } = await import("@/lib/api/members");
    const members = await searchMembers();
    const member = members[0];
    if (!member) {
      throw new ApiClientError("Member not found.", "NOT_FOUND", 404);
    }
    const existing = demoStream.find(
      (entry) =>
        entry.userId === member.id &&
        new Date(entry.checkedInAt).toDateString() === new Date().toDateString(),
    );
    if (existing) {
      return existing;
    }
    const entry: FrontDeskCheckIn = {
      id: `checkin-qr-${Date.now()}`,
      userId: member.id,
      displayName: member.displayName ?? member.email,
      memberCode: demoMemberCode(member.email),
      checkedInAt: new Date().toISOString(),
      locationName: "Main Studio",
      membershipStatus: "ACTIVE",
      source: "qr",
    };
    demoStream = [entry, ...demoStream];
    return entry;
  }

  const created = await apiRequest<FrontDeskCheckInApi>("/api/v1/attendance/check-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapCheckIn(created);
}
