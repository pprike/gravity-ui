import { addDays, parseSessionInstant, startOfWeek, toIsoDate } from "@/lib/schedule/format";
import type {
  ClassRosterEntry,
  ClassSession,
  ClassTemplate,
  CreateClassSessionPayload,
  CreateClassTemplatePayload,
  UpdateClassSessionPayload,
} from "@/lib/types/schedule";

const DEMO_SCHEDULE_KEY = "gravity-demo-schedule-v2";

export const DEMO_COACHES = [
  { id: "coach-elena", name: "Elena Rostova" },
  { id: "coach-sarah", name: "Sarah Mitchell" },
  { id: "coach-dave", name: "Dave Briggs" },
  { id: "coach-chloe", name: "Chloe Jenkins" },
] as const;

const LOCATION_ID = "loc-1";
const LOCATION_NAME = "Downtown Studio A";

interface DemoSpec {
  id: string;
  day: number;
  start: string;
  minutes: number;
  name: string;
  description: string;
  coach: (typeof DEMO_COACHES)[number]["id"];
  capacity: number;
  booked: number;
  waitlist?: number;
  status?: string;
}

const DESCRIPTIONS: Record<string, string> = {
  "Sunrise Yoga Flow": "Gentle wake-up flow focused on breath and spinal mobility.",
  "Strength Builder": "Compound lifts and accessory work in a coached small group.",
  "Iron Cycle": "High-energy indoor cycling with climbs and sprint intervals.",
  "HIIT Burn": "High intensity intervals structured to burn fat and build endurance.",
  "HIIT Shred": "Short work windows, minimal rest, full-body conditioning.",
  "Reformer Pilates": "Spring-loaded reformer work for control and core strength.",
  "Core Pilates": "Mat-based core sequencing with progressive holds.",
  "Kettlebell Conditioning": "Swings, cleans, and carries built into a metabolic circuit.",
  "Power Vinyasa": "Flow-based vinyasa with strength holds and inversions.",
  "Olympic Weightlifting": "Snatch and clean & jerk technique with coached progressions.",
  "Mobility & Stretch": "Slow, restorative session to unlock hips, shoulders, and ankles.",
  "Ashtanga Flow": "Traditional ashtanga primary series sequence.",
  "Evening Bootcamp": "Team-based strength and conditioning to close out the day.",
  "Weekend Bootcamp": "Partner circuits, sleds, and finishers.",
  "Metcon Circuit": "Timed stations blending barbell, machine, and bodyweight work.",
  "Evening Yoga": "Wind-down flow with long holds and guided breathing.",
};

function spec(
  id: string,
  day: number,
  start: string,
  minutes: number,
  name: string,
  coach: (typeof DEMO_COACHES)[number]["id"],
  capacity: number,
  booked: number,
  waitlist = 0,
): DemoSpec {
  return {
    id: id.startsWith("session-") ? id : `session-${id}`,
    day,
    start,
    minutes,
    name,
    description: DESCRIPTIONS[name] ?? "Coached group class.",
    coach,
    capacity,
    booked,
    waitlist,
  };
}

/**
 * A realistic studio week: dense morning and evening peaks with several classes
 * running at once, plus a quieter midday. Exercises the calendar's lane packing.
 */
const DEMO_SPECS: DemoSpec[] = [
  // Monday
  spec("mon-sunrise", 0, "06:00", 60, "Sunrise Yoga Flow", "coach-elena", 20, 11),
  spec("mon-strength", 0, "06:00", 75, "Strength Builder", "coach-dave", 15, 15),
  spec("mon-cycle", 0, "06:30", 45, "Iron Cycle", "coach-chloe", 24, 19),
  spec("session-hiit-burn", 0, "12:00", 60, "HIIT Burn", "coach-sarah", 25, 25, 3),
  spec("mon-reformer", 0, "17:30", 50, "Reformer Pilates", "coach-elena", 12, 10),
  spec("mon-kettlebell", 0, "18:00", 45, "Kettlebell Conditioning", "coach-dave", 16, 9),

  // Tuesday
  spec("tue-vinyasa", 1, "07:00", 60, "Power Vinyasa", "coach-elena", 20, 18),
  spec("tue-shred", 1, "07:00", 45, "HIIT Shred", "coach-sarah", 25, 12),
  spec("tue-barbell", 1, "09:00", 60, "Olympic Weightlifting", "coach-dave", 8, 8),
  spec("tue-cycle", 1, "18:00", 45, "Iron Cycle", "coach-chloe", 24, 21),
  spec("tue-mobility", 1, "19:00", 45, "Mobility & Stretch", "coach-elena", 18, 6),

  // Wednesday — the stress-test morning block
  spec("wed-ashtanga", 2, "06:00", 75, "Ashtanga Flow", "coach-elena", 20, 8),
  spec("wed-hiit", 2, "06:00", 45, "HIIT Burn", "coach-sarah", 25, 22),
  spec("wed-cycle", 2, "06:00", 45, "Iron Cycle", "coach-chloe", 24, 24, 5),
  spec("wed-strength", 2, "06:15", 60, "Strength Builder", "coach-dave", 15, 13),
  spec("wed-core", 2, "12:00", 45, "Core Pilates", "coach-elena", 14, 7),
  spec("wed-bootcamp", 2, "18:00", 60, "Evening Bootcamp", "coach-sarah", 30, 26),

  // Thursday
  spec("thu-vinyasa", 3, "06:30", 60, "Power Vinyasa", "coach-elena", 20, 14),
  spec("thu-metcon", 3, "07:00", 45, "Metcon Circuit", "coach-sarah", 20, 20, 2),
  spec("thu-barbell", 3, "09:00", 60, "Olympic Weightlifting", "coach-dave", 8, 5),
  spec("thu-cycle", 3, "17:30", 45, "Iron Cycle", "coach-chloe", 24, 17),
  spec("thu-yoga", 3, "19:00", 60, "Evening Yoga", "coach-elena", 20, 12),

  // Friday
  spec("fri-sunrise", 4, "06:00", 60, "Sunrise Yoga Flow", "coach-elena", 20, 9),
  spec("fri-strength", 4, "06:00", 75, "Strength Builder", "coach-dave", 15, 12),
  spec("fri-shred", 4, "12:00", 45, "HIIT Shred", "coach-sarah", 25, 10),
  spec("fri-cycle", 4, "17:30", 45, "Iron Cycle", "coach-chloe", 24, 23),
  spec("fri-reformer", 4, "18:00", 50, "Reformer Pilates", "coach-elena", 12, 12, 4),

  // Saturday
  spec("sat-bootcamp", 5, "08:00", 60, "Weekend Bootcamp", "coach-sarah", 30, 28),
  spec("sat-vinyasa", 5, "08:00", 75, "Power Vinyasa", "coach-elena", 20, 16),
  spec("sat-cycle", 5, "09:30", 45, "Iron Cycle", "coach-chloe", 24, 20),
  spec("sat-kettlebell", 5, "10:00", 45, "Kettlebell Conditioning", "coach-dave", 16, 11),

  // Sunday
  spec("sun-ashtanga", 6, "09:00", 75, "Ashtanga Flow", "coach-elena", 20, 13),
  spec("sun-mobility", 6, "10:30", 45, "Mobility & Stretch", "coach-elena", 18, 8),
  spec("sun-strength", 6, "12:00", 60, "Strength Builder", "coach-dave", 15, 12),
  {
    ...spec("sun-cycle", 6, "17:00", 45, "Iron Cycle", "coach-chloe", 24, 4),
    status: "cancelled",
  },
];

function coachName(coachUserId: string): string {
  return DEMO_COACHES.find((coach) => coach.id === coachUserId)?.name ?? "Coach";
}

function addMinutes(date: string, time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const start = new Date(`${date}T00:00:00`);
  start.setHours(hours, mins + minutes, 0, 0);
  return `${toIsoDate(start)}T${String(start.getHours()).padStart(2, "0")}:${String(
    start.getMinutes(),
  ).padStart(2, "0")}:00`;
}

/** Rebuilt against the current week so the demo never drifts into the past. */
function defaultSessions(): ClassSession[] {
  const monday = startOfWeek(new Date());
  return DEMO_SPECS.map((item) => {
    const date = toIsoDate(addDays(monday, item.day));
    return {
      id: item.id,
      tenantId: "demo-org",
      templateId: `template-${item.id}`,
      locationId: LOCATION_ID,
      coachUserId: item.coach,
      name: item.name,
      description: item.description,
      startsAt: `${date}T${item.start}:00`,
      endsAt: addMinutes(date, item.start, item.minutes),
      capacity: item.capacity,
      bookedCount: item.booked,
      status: item.status ?? "scheduled",
      bookedByMe: false,
      coachName: coachName(item.coach),
      locationName: LOCATION_NAME,
      waitlistCount: item.waitlist ?? 0,
    } satisfies ClassSession;
  });
}

const DEFAULT_ROSTER: Record<string, ClassRosterEntry[]> = {
  "session-hiit-burn": [
    roster("Ashley Cole", "All Access Elite", "2026-08-01T09:45:00", "confirmed"),
    roster("David Chen", "Monthly Unlimited", "2026-08-01T10:12:00", "confirmed"),
    roster("Priya Shah", "10-Class Pass", "2026-08-01T11:03:00", "confirmed"),
    roster("Marcus Bell", "All Access Elite", "2026-08-01T14:20:00", "confirmed"),
    roster("Nina Park", "Monthly Unlimited", "2026-08-02T08:05:00", "confirmed"),
    roster("Omar Haddad", "All Access Elite", "2026-08-02T09:18:00", "confirmed"),
    roster("Lila Grant", "10-Class Pass", "2026-08-02T12:40:00", "confirmed"),
    roster("Chris Nguyen", "Monthly Unlimited", "2026-08-03T07:55:00", "confirmed"),
    roster("Sofia Alvarez", "All Access Elite", "2026-08-03T09:10:00", "confirmed"),
    roster("James Porter", "Monthly Unlimited", "2026-08-03T16:22:00", "confirmed"),
    roster("Ava Brooks", "10-Class Pass", "2026-08-04T08:31:00", "confirmed"),
    roster("Kenji Mori", "All Access Elite", "2026-08-04T09:02:00", "confirmed"),
    roster("Riley Thompson", "Monthly Unlimited", "2026-08-04T18:14:00", "waitlisted"),
    roster("Maya Singh", "10-Class Pass", "2026-08-04T19:01:00", "waitlisted"),
    roster("Owen Blake", "All Access Elite", "2026-08-05T07:44:00", "waitlisted"),
  ],
};

function roster(
  displayName: string,
  planName: string,
  bookedAt: string,
  bookingStatus: "confirmed" | "waitlisted",
): ClassRosterEntry {
  const id = displayName.toLowerCase().replace(/\s+/g, "-");
  return {
    bookingId: `booking-${id}`,
    userId: `user-${id}`,
    displayName,
    email: `${id.replace("-", ".")}@email.com`,
    phone: null,
    bookingStatus,
    membershipStatus: "active",
    planName,
    bookedAt,
  };
}

/** Only user-created content is persisted; the sample week is always regenerated. */
interface DemoScheduleStore {
  createdSessions: ClassSession[];
  templates: ClassTemplate[];
  rosters: Record<string, ClassRosterEntry[]>;
}

function emptyStore(): DemoScheduleStore {
  return { createdSessions: [], templates: [], rosters: {} };
}

function readStore(): DemoScheduleStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(DEMO_SCHEDULE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<DemoScheduleStore>;
    return {
      createdSessions: parsed.createdSessions ?? [],
      templates: parsed.templates ?? [],
      rosters: parsed.rosters ?? {},
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: DemoScheduleStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_SCHEDULE_KEY, JSON.stringify(store));
}

function allSessions(store: DemoScheduleStore): ClassSession[] {
  return [...defaultSessions(), ...store.createdSessions];
}

export const demoSchedule = {
  listSessions(from: string, to: string): ClassSession[] {
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    return allSessions(readStore()).filter((session) => {
      const at = parseSessionInstant(session.startsAt).getTime();
      return at >= start && at <= end;
    });
  },
  getSession(sessionId: string): ClassSession | undefined {
    return allSessions(readStore()).find((session) => session.id === sessionId);
  },
  listRoster(sessionId: string): ClassRosterEntry[] {
    return readStore().rosters[sessionId] ?? DEFAULT_ROSTER[sessionId] ?? [];
  },
  createTemplate(payload: CreateClassTemplatePayload): ClassTemplate {
    const store = readStore();
    const template: ClassTemplate = {
      id: `template-${Date.now()}-${payload.dayOfWeek}`,
      tenantId: "demo-org",
      locationId: payload.locationId,
      coachUserId: payload.coachUserId,
      name: payload.name,
      description: payload.description ?? null,
      dayOfWeek: payload.dayOfWeek,
      startTime: payload.startTime,
      durationMinutes: payload.durationMinutes,
      capacity: payload.capacity,
      recurrenceRule: payload.recurrenceRule ?? "WEEKLY",
      status: payload.status ?? "active",
    };
    store.templates.push(template);

    const [hours, minutes] = payload.startTime.split(":").map(Number);
    const monday = startOfWeek(new Date());
    for (let week = 0; week < 4; week += 1) {
      const day = addDays(monday, (payload.dayOfWeek - 1 + 7) % 7 + week * 7);
      day.setHours(hours, minutes, 0, 0);
      const ends = new Date(day.getTime() + payload.durationMinutes * 60_000);
      store.createdSessions.push({
        id: `session-${template.id}-${week}`,
        tenantId: "demo-org",
        templateId: template.id,
        locationId: payload.locationId,
        coachUserId: payload.coachUserId,
        name: payload.name,
        description: payload.description ?? null,
        startsAt: day.toISOString(),
        endsAt: ends.toISOString(),
        capacity: payload.capacity,
        bookedCount: 0,
        status: "scheduled",
        bookedByMe: false,
        coachName: coachName(payload.coachUserId),
        locationName: LOCATION_NAME,
        waitlistCount: 0,
      });
    }

    writeStore(store);
    return template;
  },
  createSession(payload: CreateClassSessionPayload): ClassSession {
    const store = readStore();
    const endsAt = new Date(
      new Date(payload.startsAt).getTime() + payload.durationMinutes * 60_000,
    ).toISOString();
    const session: ClassSession = {
      id: `session-oneoff-${Date.now()}`,
      tenantId: "demo-org",
      templateId: "",
      locationId: payload.locationId,
      coachUserId: payload.coachUserId,
      name: payload.name,
      description: payload.description ?? null,
      startsAt: payload.startsAt,
      endsAt,
      capacity: payload.capacity,
      bookedCount: 0,
      status: "scheduled",
      bookedByMe: false,
      coachName: coachName(payload.coachUserId),
      locationName: LOCATION_NAME,
      waitlistCount: 0,
    };
    store.createdSessions.push(session);
    writeStore(store);
    return session;
  },
  updateSession(sessionId: string, payload: UpdateClassSessionPayload): ClassSession {
    const store = readStore();
    const sessions = allSessions(store);
    const existing = sessions.find((session) => session.id === sessionId);
    if (!existing) {
      throw new Error("Class session not found.");
    }

    const endsAt = new Date(
      new Date(payload.startsAt).getTime() + payload.durationMinutes * 60_000,
    ).toISOString();
    const updated: ClassSession = {
      ...existing,
      locationId: payload.locationId,
      coachUserId: payload.coachUserId,
      name: payload.name,
      description: payload.description ?? null,
      startsAt: payload.startsAt,
      endsAt,
      capacity: payload.capacity,
      coachName: coachName(payload.coachUserId),
    };

    const createdIndex = store.createdSessions.findIndex(
      (session) => session.id === sessionId,
    );
    if (createdIndex >= 0) {
      store.createdSessions[createdIndex] = updated;
      writeStore(store);
      return updated;
    }

    store.createdSessions.push(updated);
    writeStore(store);
    return updated;
  },
  cancelSession(sessionId: string): ClassSession {
    const store = readStore();
    const existing = allSessions(store).find((session) => session.id === sessionId);
    if (!existing) {
      throw new Error("Class session not found.");
    }
    const updated: ClassSession = { ...existing, status: "cancelled", bookedCount: 0 };
    const createdIndex = store.createdSessions.findIndex(
      (session) => session.id === sessionId,
    );
    if (createdIndex >= 0) {
      store.createdSessions[createdIndex] = updated;
    } else {
      store.createdSessions.push(updated);
    }
    writeStore(store);
    return updated;
  },
  promoteWaitlist(sessionId: string, userId: string): void {
    const store = readStore();
    const roster = [...this.listRoster(sessionId)];
    const entry = roster.find((item) => item.userId === userId);
    if (!entry || entry.bookingStatus !== "waitlisted") return;
    entry.bookingStatus = "confirmed";
    store.rosters[sessionId] = roster;

    const existing = allSessions(store).find((session) => session.id === sessionId);
    if (existing) {
      const waitlistCount = roster.filter(
        (item) => item.bookingStatus === "waitlisted",
      ).length;
      const updated: ClassSession = {
        ...existing,
        bookedCount: existing.bookedCount + 1,
        waitlistCount,
      };
      const createdIndex = store.createdSessions.findIndex(
        (session) => session.id === sessionId,
      );
      if (createdIndex >= 0) {
        store.createdSessions[createdIndex] = updated;
      } else {
        store.createdSessions.push(updated);
      }
    }
    writeStore(store);
  },
  removeWaitlist(sessionId: string, userId: string): void {
    const store = readStore();
    const roster = this.listRoster(sessionId).filter(
      (item) => item.userId !== userId,
    );
    store.rosters[sessionId] = roster;
    const existing = allSessions(store).find((session) => session.id === sessionId);
    if (existing) {
      const waitlistCount = roster.filter(
        (item) => item.bookingStatus === "waitlisted",
      ).length;
      const updated: ClassSession = { ...existing, waitlistCount };
      const createdIndex = store.createdSessions.findIndex(
        (session) => session.id === sessionId,
      );
      if (createdIndex >= 0) {
        store.createdSessions[createdIndex] = updated;
      } else {
        store.createdSessions.push(updated);
      }
    }
    writeStore(store);
  },
};
