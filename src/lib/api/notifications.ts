import { apiRequest } from "@/lib/api/client";
import { isDemoSession } from "@/lib/settings/demo";

export interface NotificationPreferences {
  announcements: boolean;
  classMessages: boolean;
  marketing: boolean;
}

const DEMO_KEY = "gravity-demo-notification-preferences";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  announcements: true,
  classMessages: true,
  marketing: false,
};

function readDemoPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  const raw = window.localStorage.getItem(DEMO_KEY);
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } as NotificationPreferences;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writeDemoPreferences(preferences: NotificationPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_KEY, JSON.stringify(preferences));
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  if (isDemoSession()) {
    return readDemoPreferences();
  }

  return apiRequest<NotificationPreferences>("/api/v1/notifications/preferences");
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  if (isDemoSession()) {
    writeDemoPreferences(preferences);
    return preferences;
  }

  return apiRequest<NotificationPreferences>("/api/v1/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}
