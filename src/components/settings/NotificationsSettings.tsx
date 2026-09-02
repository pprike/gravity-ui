"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/api/notifications";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const PREFERENCE_ITEMS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    key: "announcements",
    title: "Announcements",
    description: "Organization-wide updates and studio news.",
  },
  {
    key: "classMessages",
    title: "Class reminders",
    description: "Booking confirmations and upcoming class reminders.",
  },
  {
    key: "marketing",
    title: "Promotional emails",
    description: "Optional studio offers, events, and news.",
  },
];

export function NotificationsSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError("");
      try {
        const loaded = await getNotificationPreferences();
        if (!cancelled) setPreferences(loaded);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Unable to load notification preferences.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!preferences) return;
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      const saved = await updateNotificationPreferences(preferences);
      setPreferences(saved);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save notification preferences.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function togglePreference(key: keyof NotificationPreferences) {
    setPreferences((current) =>
      current ? { ...current, [key]: !current[key] } : current,
    );
    setSuccess(false);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <Card className="border-danger-200 bg-danger-50">
        <p className="text-sm text-danger-700">{error || "Preferences unavailable."}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
        <Bell className="size-4 text-primary-600" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500">
            Default delivery preferences for your admin account.
          </p>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {PREFERENCE_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </div>
            <input
              type="checkbox"
              checked={preferences[item.key]}
              onChange={() => togglePreference(item.key)}
              className="mt-1 size-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
        <div>
          {error ? (
            <p className="text-sm text-danger-700" role="alert">
              {error}
            </p>
          ) : success ? (
            <p className="text-sm text-emerald-700">Preferences saved.</p>
          ) : null}
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </Card>
  );
}
