export type ClassSessionStatus = "scheduled" | "cancelled" | "completed" | string;

export interface ClassSession {
  id: string;
  tenantId: string;
  templateId: string;
  locationId: string;
  coachUserId: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  status: ClassSessionStatus;
  bookedByMe: boolean;
  coachName?: string | null;
  locationName?: string | null;
  waitlistCount?: number;
}

export interface ClassTemplate {
  id: string;
  tenantId: string;
  locationId: string;
  coachUserId: string;
  name: string;
  description: string | null;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  recurrenceRule: string;
  status: "active" | "inactive" | string;
}

export interface CreateClassTemplatePayload {
  locationId: string;
  coachUserId: string;
  name: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  recurrenceRule?: "WEEKLY";
  status?: "active" | "inactive";
}

export interface ClassRosterEntry {
  bookingId: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string | null;
  bookingStatus: string;
  membershipStatus: string | null;
  planName: string | null;
  bookedAt: string;
}

export type ClassType =
  | "yoga"
  | "pilates"
  | "hiit"
  | "strength"
  | "cycle"
  | "conditioning"
  | "other";
