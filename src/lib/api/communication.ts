import { apiRequest } from "@/lib/api/client";
import {
  demoCreateAnnouncement,
  demoListAnnouncements,
  demoSendClassMessage,
} from "@/lib/communication/demo";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import type {
  Announcement,
  ClassMessageResult,
  CreateAnnouncementPayload,
  SendClassMessagePayload,
} from "@/lib/types/communication";

export async function listAnnouncements(): Promise<Announcement[]> {
  if (demoMembershipsEnabled()) {
    return demoListAnnouncements();
  }
  return apiRequest<Announcement[]>("/api/v1/announcements");
}

export async function createAnnouncement(
  payload: CreateAnnouncementPayload,
): Promise<Announcement> {
  if (demoMembershipsEnabled()) {
    return demoCreateAnnouncement(payload);
  }
  return apiRequest<Announcement>("/api/v1/announcements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendClassMessage(
  sessionId: string,
  payload: SendClassMessagePayload,
): Promise<ClassMessageResult> {
  if (demoMembershipsEnabled()) {
    return { ...demoSendClassMessage(), sessionId, title: payload.title };
  }
  return apiRequest<ClassMessageResult>(`/api/v1/class-sessions/${sessionId}/message`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function audienceLabel(audienceType: string, locationName?: string | null): string {
  switch (audienceType) {
    case "all_members":
      return "All members";
    case "all_staff":
      return "All staff";
    case "coaches":
      return "Coaches";
    case "members_at_location":
      return locationName ? `Members at ${locationName}` : "Members at location";
    default:
      return audienceType;
  }
}

export function formatAnnouncementDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
