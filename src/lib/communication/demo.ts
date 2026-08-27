import type { Announcement, CreateAnnouncementPayload } from "@/lib/types/communication";

const demoAnnouncements: Announcement[] = [
  {
    id: "announcement-1",
    title: "Holiday hours update",
    body: "Main Studio will be closed Monday for the holiday. All classes resume Tuesday at 6 AM.",
    audienceType: "all_members",
    locationId: null,
    authorUserId: "demo-admin",
    authorName: "Studio Admin",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recipientCount: 128,
  },
];

export function demoListAnnouncements(): Announcement[] {
  return [...demoAnnouncements].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function demoCreateAnnouncement(
  payload: CreateAnnouncementPayload,
): Announcement {
  const entry: Announcement = {
    id: `announcement-${Date.now()}`,
    title: payload.title,
    body: payload.body,
    audienceType: payload.audienceType,
    locationId: payload.locationId ?? null,
    authorUserId: "demo-admin",
    authorName: "Studio Admin",
    publishedAt: new Date().toISOString(),
    recipientCount: payload.audienceType === "coaches" ? 6 : 128,
  };
  demoAnnouncements.unshift(entry);
  return entry;
}

export function demoSendClassMessage(recipientCount = 12) {
  return {
    sessionId: "demo-session",
    title: "Class update",
    recipientCount,
  };
}
