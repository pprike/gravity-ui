"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createAnnouncement } from "@/lib/api/communication";
import { listLocations } from "@/lib/api/locations";
import { ApiClientError } from "@/lib/api/client";
import type {
  Announcement,
  AnnouncementAudienceType,
  CreateAnnouncementPayload,
} from "@/lib/types/communication";
import type { Location } from "@/lib/types/settings";

interface AnnouncementComposerProps {
  onCreated: (announcement: Announcement) => void;
  onCancel?: () => void;
}

const AUDIENCE_OPTIONS: Array<{ value: AnnouncementAudienceType; label: string }> = [
  { value: "all_members", label: "All members" },
  { value: "all_staff", label: "All staff" },
  { value: "coaches", label: "Coaches" },
  { value: "members_at_location", label: "Members at a location" },
];

export function AnnouncementComposer({ onCreated, onCancel }: AnnouncementComposerProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState<AnnouncementAudienceType>("all_members");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await listLocations();
        if (!cancelled) {
          setLocations(rows);
          if (rows[0]) setLocationId(rows[0].id);
        }
      } catch {
        if (!cancelled) setLocations([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CreateAnnouncementPayload = {
      title: title.trim(),
      body: body.trim(),
      audienceType,
      locationId:
        audienceType === "members_at_location" && locationId ? locationId : undefined,
    };

    try {
      const created = await createAnnouncement(payload);
      onCreated(created);
      setTitle("");
      setBody("");
      setAudienceType("all_members");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to publish announcement.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Megaphone className="size-4 text-primary-600" />
        <h2 className="text-base font-bold text-slate-900">New announcement</h2>
      </div>
      <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Holiday hours, schedule change, etc."
          required
        />
        <Textarea
          label="Message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write the announcement members and staff will see."
          rows={6}
          required
        />
        <Select
          label="Audience"
          value={audienceType}
          onChange={(event) =>
            setAudienceType(event.target.value as AnnouncementAudienceType)
          }
          options={AUDIENCE_OPTIONS}
        />
        {audienceType === "members_at_location" ? (
          <Select
            label="Location"
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            options={locations.map((location) => ({
              value: location.id,
              label: location.name,
            }))}
          />
        ) : null}
        {error ? <p className="text-sm text-danger-700">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting || !title.trim() || !body.trim()}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Publish announcement
          </Button>
          {onCancel ? (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
