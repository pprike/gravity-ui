export type AnnouncementAudienceType =
  | "all_members"
  | "all_staff"
  | "coaches"
  | "members_at_location";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audienceType: AnnouncementAudienceType;
  locationId: string | null;
  authorUserId: string;
  authorName: string;
  publishedAt: string;
  recipientCount: number;
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  audienceType: AnnouncementAudienceType;
  locationId?: string;
}

export interface SendClassMessagePayload {
  title: string;
  body: string;
}

export interface ClassMessageResult {
  sessionId: string;
  title: string;
  recipientCount: number;
}
