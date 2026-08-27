"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Megaphone, Plus } from "lucide-react";
import { AnnouncementComposer } from "@/components/communication/AnnouncementComposer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  audienceLabel,
  formatAnnouncementDate,
  listAnnouncements,
} from "@/lib/api/communication";
import { listLocations } from "@/lib/api/locations";
import type { Announcement } from "@/lib/types/communication";
import type { Location } from "@/lib/types/settings";

export function CommunicationHubView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      const [rows, locationRows] = await Promise.all([
        listAnnouncements(),
        listLocations().catch(() => []),
      ]);
      setAnnouncements(rows);
      setLocations(locationRows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load announcements.");
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadAnnouncements();
    }, 0);
    return () => clearTimeout(timeout);
  }, [loadAnnouncements]);

  const locationNames = useMemo(
    () => new Map(locations.map((location) => [location.id, location.name])),
    [locations],
  );

  function handleCreated(announcement: Announcement) {
    setAnnouncements((current) => [announcement, ...current]);
    setShowComposer(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Communication</h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish announcements to members and staff across your organization.
          </p>
        </div>
        {!showComposer ? (
          <Button onClick={() => setShowComposer(true)}>
            <Plus className="size-4" />
            New announcement
          </Button>
        ) : null}
      </div>

      {showComposer ? (
        <AnnouncementComposer
          onCreated={handleCreated}
          onCancel={() => setShowComposer(false)}
        />
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary-600" />
        </div>
      ) : error ? (
        <Card className="border-danger-200 bg-danger-50 p-4">
          <p className="text-sm text-danger-700">{error}</p>
        </Card>
      ) : announcements.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Megaphone className="size-8 text-slate-300" />
          <div>
            <p className="text-base font-semibold text-slate-900">No announcements yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Publish your first update to keep members and staff informed.
            </p>
          </div>
          {!showComposer ? (
            <Button onClick={() => setShowComposer(true)}>
              <Plus className="size-4" />
              New announcement
            </Button>
          ) : null}
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {announcement.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {announcement.authorName} ·{" "}
                    {formatAnnouncementDate(announcement.publishedAt)}
                  </p>
                </div>
                <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  {audienceLabel(
                    announcement.audienceType,
                    announcement.locationId
                      ? locationNames.get(announcement.locationId)
                      : null,
                  )}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {announcement.body}
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                Delivered to {announcement.recipientCount} recipient
                {announcement.recipientCount === 1 ? "" : "s"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
