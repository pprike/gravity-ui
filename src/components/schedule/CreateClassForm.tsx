"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { getBookingRules } from "@/lib/api/booking-rules";
import { listLocations } from "@/lib/api/locations";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";
import { createClassTemplate, listScheduleCoaches } from "@/lib/api/schedule";
import { listStaff } from "@/lib/api/staff";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormDivider } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Location, StaffMember } from "@/lib/types/settings";

const CLASS_TYPES = ["Yoga", "HIIT", "Strength", "Cycle", "Other"];
const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

interface CreateClassFormState {
  name: string;
  classType: string;
  coachUserId: string;
  locationId: string;
  capacity: string;
  description: string;
  startTime: string;
  durationMinutes: string;
  recurring: boolean;
  days: number[];
}

const EMPTY: CreateClassFormState = {
  name: "",
  classType: "HIIT",
  coachUserId: "",
  locationId: "",
  capacity: "20",
  description: "",
  startTime: "09:00",
  durationMinutes: "60",
  recurring: true,
  days: [2],
};

function SectionHeading({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-800">
        {step}
      </span>
      <h3 className="text-base font-bold text-slate-900">{children}</h3>
    </div>
  );
}

export function CreateClassForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateClassFormState>(EMPTY);
  const [locations, setLocations] = useState<Location[]>([]);
  const [coaches, setCoaches] = useState<Array<{ id: string; name: string }>>([]);
  const [bookingWindow, setBookingWindow] = useState("7 days before");
  const [cancellationWindow, setCancellationWindow] = useState("12 hours before");
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [loadedLocations, staff, rules] = await Promise.all([
          listLocations(),
          listStaff().catch(() => [] as StaffMember[]),
          getBookingRules().catch(() => null),
        ]);
        if (cancelled) return;
        const staffCoaches = staff
          .filter((member) => member.roleName.toLowerCase() === "coach")
          .map((member) => ({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`.trim(),
          }));
        const nextCoaches =
          staffCoaches.length > 0
            ? staffCoaches
            : demoMembershipsEnabled()
              ? listScheduleCoaches()
              : [];
        const activeLocations = loadedLocations.filter(
          (location) => location.status === "active",
        );
        setLocations(activeLocations);
        setCoaches(nextCoaches);
        setForm((current) => ({
          ...current,
          locationId: current.locationId || activeLocations[0]?.id || "",
          coachUserId: current.coachUserId || nextCoaches[0]?.id || "",
        }));
        if (rules) {
          setBookingWindow(`${rules.advanceBookingLimitDays} days before`);
          setCancellationWindow(`${rules.cancellationWindowHours} hours before`);
          setWaitlistEnabled(rules.waitlistEnabled);
        }
      } catch {
        if (!cancelled) setError("Unable to load class form options.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof CreateClassFormState>(
    key: K,
    value: CreateClassFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggleDay(day: number) {
    setForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((value) => value !== day)
        : [...current.days, day].sort(),
    }));
  }

  const locationOptions = useMemo(
    () => locations.map((location) => ({ value: location.id, label: location.name })),
    [locations],
  );
  const coachOptions = useMemo(
    () => coaches.map((coach) => ({ value: coach.id, label: coach.name })),
    [coaches],
  );

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Class name is required.");
      return;
    }
    if (!form.locationId || !form.coachUserId) {
      setError("Coach and location are required.");
      return;
    }
    const days = form.recurring ? form.days : [new Date().getDay() || 7];
    if (days.length === 0) {
      setError("Select at least one day.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      for (const dayOfWeek of days) {
        await createClassTemplate({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          locationId: form.locationId,
          coachUserId: form.coachUserId,
          dayOfWeek,
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes) || 60,
          capacity: Number(form.capacity) || 20,
          recurrenceRule: "WEEKLY",
          status: "active",
        });
      }
      router.push("/schedule");
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Unable to save class.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Card padding="lg" className="space-y-8">
      {error ? (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      ) : null}

      <section className="space-y-5">
        <SectionHeading step={1}>Class Details</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Class Name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            showRequired
          />
          <Select
            label="Class Type"
            value={form.classType}
            onChange={(event) => update("classType", event.target.value)}
            options={CLASS_TYPES.map((type) => ({ value: type, label: type }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Coach"
            value={form.coachUserId}
            onChange={(event) => update("coachUserId", event.target.value)}
            options={
              coachOptions.length > 0
                ? coachOptions
                : [{ value: "", label: "No coaches available" }]
            }
            showRequired
          />
          <Select
            label="Location"
            value={form.locationId}
            onChange={(event) => update("locationId", event.target.value)}
            options={
              locationOptions.length > 0
                ? locationOptions
                : [{ value: "", label: "No locations available" }]
            }
            showRequired
          />
          <Input
            label="Capacity"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(event) => update("capacity", event.target.value)}
            showRequired
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start Time"
            type="time"
            value={form.startTime}
            onChange={(event) => update("startTime", event.target.value)}
            showRequired
          />
          <Input
            label="Duration (minutes)"
            type="number"
            min={15}
            value={form.durationMinutes}
            onChange={(event) => update("durationMinutes", event.target.value)}
            showRequired
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="class-description" className="block text-[13px] font-medium text-slate-800">
            Description
          </label>
          <textarea
            id="class-description"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          />
        </div>
      </section>

      <FormDivider />

      <section className="space-y-5">
        <SectionHeading step={2}>Recurrence Rules</SectionHeading>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Recurring Class</p>
            <p className="text-xs text-slate-500">
              Automatically schedule this class on a repeating weekly pattern
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.recurring}
            onClick={() => update("recurring", !form.recurring)}
            className={`flex h-6 w-11 items-center rounded-full p-0.5 ${
              form.recurring ? "justify-end bg-primary-600" : "justify-start bg-slate-300"
            }`}
          >
            <span className="size-5 rounded-full bg-white" />
          </button>
        </div>
        {form.recurring ? (
          <>
            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-800">Repeat On</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const selected = form.days.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-lg px-4 py-2.5 text-[13px] font-semibold ${
                        selected
                          ? "bg-primary-600 text-white"
                          : "border border-neutral-200 bg-white text-slate-600"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Frequency"
                value="WEEKLY"
                options={[{ value: "WEEKLY", label: "Weekly" }]}
                disabled
              />
              <Input label="End Date" value="Open-ended" readOnly className="bg-slate-50" />
            </div>
          </>
        ) : null}
      </section>

      <FormDivider />

      <section className="space-y-5">
        <SectionHeading step={3}>Booking Rules</SectionHeading>
        <p className="text-xs text-slate-500">
          These values come from organization booking rules and apply to all classes.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Booking Window Opens" value={bookingWindow} readOnly className="bg-slate-50" />
          <Input
            label="Cancellation Window"
            value={cancellationWindow}
            readOnly
            className="bg-slate-50"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Enable Waitlist</p>
            <p className="text-xs text-slate-500">
              Allow members to join waitlist once maximum capacity is reached
            </p>
          </div>
          <div
            className={`flex h-6 w-11 items-center rounded-full p-0.5 ${
              waitlistEnabled ? "justify-end bg-primary-600" : "justify-start bg-slate-300"
            }`}
          >
            <span className="size-5 rounded-full bg-white" />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/schedule")}>
          Cancel
        </Button>
        <Button type="button" onClick={() => void handleSave()} isLoading={isSaving}>
          Save Class
        </Button>
      </div>
    </Card>
  );
}
