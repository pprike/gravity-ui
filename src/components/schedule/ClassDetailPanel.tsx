"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Mail, MapPin, Pencil, Trash2, Users, X } from "lucide-react";
import { ClassMessagePanel } from "@/components/communication/ClassMessagePanel";
import { ApiClientError } from "@/lib/api/client";
import { listLocations } from "@/lib/api/locations";
import {
  cancelClassSession,
  listScheduleCoaches,
  updateClassSession,
} from "@/lib/api/schedule";
import { listStaff } from "@/lib/api/staff";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import {
  classTypeStyles,
  formatSessionDateTime,
  inferClassType,
} from "@/lib/schedule/format";
import type { ClassSession } from "@/lib/types/schedule";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ClassDetailPanelProps {
  session: ClassSession;
  onClose: () => void;
  onSessionChanged?: (session: ClassSession) => void;
}

function toLocalDateTimeValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function durationMinutes(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 60;
  return Math.round((end - start) / 60_000);
}

export function ClassDetailPanel({
  session,
  onClose,
  onSessionChanged,
}: ClassDetailPanelProps) {
  const type = inferClassType(session.name);
  const styles = classTypeStyles(type);
  const waitlist = session.waitlistCount ?? 0;
  const isCancelled = session.status === "cancelled";
  const isPast = new Date(session.startsAt).getTime() <= Date.now();
  const canManage = !isCancelled && !isPast;

  const [isEditing, setIsEditing] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [coaches, setCoaches] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({
    name: session.name,
    locationId: session.locationId,
    coachUserId: session.coachUserId,
    startsAt: toLocalDateTimeValue(session.startsAt),
    durationMinutes: String(durationMinutes(session.startsAt, session.endsAt)),
    capacity: String(session.capacity),
    description: session.description ?? "",
  });

  useEffect(() => {
    setForm({
      name: session.name,
      locationId: session.locationId,
      coachUserId: session.coachUserId,
      startsAt: toLocalDateTimeValue(session.startsAt),
      durationMinutes: String(durationMinutes(session.startsAt, session.endsAt)),
      capacity: String(session.capacity),
      description: session.description ?? "",
    });
    setIsEditing(false);
    setIsMessaging(false);
    setError("");
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [loadedLocations, staff] = await Promise.all([
          listLocations(),
          listStaff().catch(() => []),
        ]);
        if (cancelled) return;

        const coachOptions = staff.map((member) => ({
          id: member.id,
          name: [member.firstName, member.lastName].filter(Boolean).join(" "),
        }));

        if (demoMembershipsEnabled()) {
          for (const coach of listScheduleCoaches()) {
            if (!coachOptions.some((option) => option.id === coach.id)) {
              coachOptions.push(coach);
            }
          }
        }

        setLocations(loadedLocations.map((location) => ({
          id: location.id,
          name: location.name,
        })));
        setCoaches(coachOptions);
      } catch {
        if (!cancelled) setError("Unable to load edit options.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const locationOptions = useMemo(
    () => locations.map((location) => ({ value: location.id, label: location.name })),
    [locations],
  );
  const coachOptions = useMemo(
    () => coaches.map((coach) => ({ value: coach.id, label: coach.name })),
    [coaches],
  );

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      const updated = await updateClassSession(session.id, {
        locationId: form.locationId,
        coachUserId: form.coachUserId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        startsAt: new Date(form.startsAt).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        capacity: Number(form.capacity),
      });
      setIsEditing(false);
      onSessionChanged?.(updated);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to update this class session.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      `Cancel "${session.name}"? Confirmed members and the waitlist will be notified.`,
    );
    if (!confirmed) return;

    setIsCancelling(true);
    setError("");
    try {
      const updated = await cancelClassSession(session.id);
      onSessionChanged?.(updated);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to cancel this class session.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <aside className="flex h-full flex-col bg-white">
      <div className="flex items-start justify-between gap-3 px-5 py-5">
        <div>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}
          >
            {styles.label}
          </span>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{session.name}</h2>
          {isCancelled ? (
            <p className="mt-1 text-sm font-medium text-rose-700">Cancelled</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close class details"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-auto px-5 pb-5">
        {error ? (
          <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}

        {isMessaging ? (
          <ClassMessagePanel
            sessionId={session.id}
            className={session.name}
            rosterSize={session.bookedCount}
          />
        ) : isEditing ? (
          <div className="space-y-4">
            <Input
              label="Class Name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Select
              label="Location"
              options={locationOptions}
              value={form.locationId}
              onChange={(event) =>
                setForm((current) => ({ ...current, locationId: event.target.value }))
              }
            />
            <Select
              label="Coach"
              options={coachOptions}
              value={form.coachUserId}
              onChange={(event) =>
                setForm((current) => ({ ...current, coachUserId: event.target.value }))
              }
            />
            <div className="space-y-1.5">
              <label
                htmlFor="session-start"
                className="block text-[13px] font-medium text-slate-800"
              >
                Start Date / Time
              </label>
              <input
                id="session-start"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startsAt: event.target.value }))
                }
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes: event.target.value,
                  }))
                }
              />
              <Input
                label="Capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, capacity: event.target.value }))
                }
              />
            </div>
            <Input
              label="Description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => void handleSave()} isLoading={isSaving}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel Edit
              </Button>
            </div>
          </div>
        ) : (
          <>
            {session.description ? (
              <p className="text-sm leading-6 text-slate-600">{session.description}</p>
            ) : null}

            <dl className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Coach
                  </dt>
                  <dd>{session.coachName ?? "Unassigned"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date / Time
                  </dt>
                  <dd>{formatSessionDateTime(session.startsAt, session.endsAt)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </dt>
                  <dd>{session.locationName ?? "Location TBD"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Capacity
                  </dt>
                  <dd>
                    {session.bookedCount}/{session.capacity} spots filled
                  </dd>
                  {waitlist > 0 ? (
                    <p className="mt-1 text-sm font-medium text-orange-600">
                      Waitlist: {waitlist} members
                    </p>
                  ) : null}
                </div>
              </div>
            </dl>

            <Link
              href={`/schedule/${session.id}/roster`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              <Users className="size-4" />
              View Full Class Roster
            </Link>
          </>
        )}
      </div>

      {canManage ? (
        <div className="space-y-2 border-t border-neutral-200 p-5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isEditing || isCancelling}
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="text-rose-700"
              disabled={isEditing || isCancelling}
              isLoading={isCancelling}
              onClick={() => void handleCancel()}
            >
              <Trash2 className="size-4" />
              Cancel
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={isEditing || isCancelling}
            onClick={() => {
              setIsMessaging((current) => !current);
              setIsEditing(false);
            }}
            fullWidth
          >
            <Mail className="size-4" />
            {isMessaging ? "Hide Message Form" : "Message Class Members"}
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
