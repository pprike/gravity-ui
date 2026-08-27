export interface FrontDeskCheckIn {
  id: string;
  userId: string;
  displayName: string;
  memberCode: string;
  checkedInAt: string;
  locationName: string | null;
  membershipStatus: "ACTIVE" | "PENDING RENEWAL" | string;
  source: "manual" | "qr" | "booking" | string;
}

export interface ManualCheckInPayload {
  userId: string;
  locationId?: string;
}

export type ClassAttendanceStatus = "attended" | "late" | "no_show";

export interface ClassAttendanceEntry {
  userId: string;
  status: ClassAttendanceStatus;
  markedAt: string;
  markedBy: string;
  markedByName: string | null;
}

export interface MarkClassAttendancePayload {
  userId: string;
  status: ClassAttendanceStatus;
}

export interface QrCheckInPayload {
  token: string;
  locationId?: string;
}
