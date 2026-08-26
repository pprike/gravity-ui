import type { FrontDeskCheckIn } from "@/lib/types/attendance";

const now = Date.now();

export const demoFrontDeskCheckIns: FrontDeskCheckIn[] = [
  {
    id: "checkin-1",
    userId: "demo-member-1",
    displayName: "Alex Rivera",
    memberCode: "#M-1042",
    checkedInAt: new Date(now - 2 * 60_000).toISOString(),
    locationName: "Main Studio",
    membershipStatus: "ACTIVE",
    source: "qr",
  },
  {
    id: "checkin-2",
    userId: "demo-member-2",
    displayName: "Jessica Chen",
    memberCode: "#M-0881",
    checkedInAt: new Date(now - 8 * 60_000).toISOString(),
    locationName: "Main Studio",
    membershipStatus: "ACTIVE",
    source: "manual",
  },
  {
    id: "checkin-3",
    userId: "demo-member-4",
    displayName: "Sarah Lindqvist",
    memberCode: "#M-1204",
    checkedInAt: new Date(now - 21 * 60_000).toISOString(),
    locationName: "Main Studio",
    membershipStatus: "PENDING RENEWAL",
    source: "manual",
  },
  {
    id: "checkin-4",
    userId: "demo-member-5",
    displayName: "Marcus Thompson",
    memberCode: "#M-0763",
    checkedInAt: new Date(now - 35 * 60_000).toISOString(),
    locationName: "Main Studio",
    membershipStatus: "ACTIVE",
    source: "qr",
  },
];
