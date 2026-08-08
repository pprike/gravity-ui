"use client";

import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { getBookingRules, updateBookingRules } from "@/lib/api/booking-rules";
import type { BookingRules } from "@/lib/types/memberships";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormDivider, FormSection } from "@/components/ui/FormSection";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";

const HOUR_OPTIONS = [2, 4, 6, 12, 24, 48].map((h) => ({
  value: String(h),
  label: `${h} Hours`,
}));

const DAY_OPTIONS = [1, 3, 7, 14, 30].map((d) => ({
  value: String(d),
  label: d === 1 ? "1 Day Before" : `${d} Days Before`,
}));

const BOOKING_LIMIT_OPTIONS = [3, 4, 5, 6, 8, 10, 12].map((n) => ({
  value: String(n),
  label: `${n} Classes`,
}));

interface RulesForm {
  maxActiveBookings: string;
  advanceBookingLimitDays: string;
  cancellationWindowHours: string;
  waitlistEnabled: boolean;
}

function toForm(rules: BookingRules): RulesForm {
  return {
    maxActiveBookings: String(rules.maxActiveBookings),
    advanceBookingLimitDays: String(rules.advanceBookingLimitDays),
    cancellationWindowHours: String(rules.cancellationWindowHours),
    waitlistEnabled: rules.waitlistEnabled,
  };
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <div className="w-full sm:w-[180px]">{children}</div>
    </div>
  );
}

export function BookingRulesSettings({ embedded = false }: { embedded?: boolean }) {
  const [form, setForm] = useState<RulesForm | null>(null);
  const [initialForm, setInitialForm] = useState<RulesForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rules = await getBookingRules();
        if (cancelled) return;
        const loaded = toForm(rules);
        setForm(loaded);
        setInitialForm(loaded);
      } catch {
        if (!cancelled) setError("Unable to load booking rules.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty =
    form && initialForm && JSON.stringify(form) !== JSON.stringify(initialForm);

  async function handleSave() {
    if (!form) return;
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      await updateBookingRules({
        maxActiveBookings: Number.parseInt(form.maxActiveBookings, 10),
        advanceBookingLimitDays: Number.parseInt(
          form.advanceBookingLimitDays,
          10,
        ),
        cancellationWindowHours: Number.parseInt(
          form.cancellationWindowHours,
          10,
        ),
        waitlistEnabled: form.waitlistEnabled,
      });
      setInitialForm(form);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save booking rules.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !form) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={
          embedded
            ? "flex justify-end"
            : "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        }
      >
        {!embedded && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Booking Rules Configuration
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure how members book, cancel, and join waitlists.
            </p>
          </div>
        )}
        {embedded && (
          <p className="mr-auto text-sm text-slate-500">
            Configure how members book, cancel, and join waitlists.
          </p>
        )}
        <Button
          type="button"
          onClick={() => void handleSave()}
          isLoading={isSaving}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </div>

      {error && (
        <Card className="border-danger-200 bg-danger-50">
          <p className="text-sm text-danger-700">{error}</p>
        </Card>
      )}
      {success && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-800">Booking rules saved.</p>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <FormSection
            title="General Booking Parameters"
            description="Control how many classes members can book and how far in advance."
          />
          <FormDivider />
          <div className="mt-5 space-y-4">
            <SettingRow
              title="Maximum Active Bookings"
              description="Limit how many upcoming classes a single member can hold at once"
            >
              <Select
                label=""
                aria-label="Maximum active bookings"
                value={form.maxActiveBookings}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, maxActiveBookings: e.target.value } : f,
                  )
                }
                options={BOOKING_LIMIT_OPTIONS}
              />
            </SettingRow>
            <SettingRow
              title="Booking Window Opens"
              description="How far in advance members can book their spots"
            >
              <Select
                label=""
                aria-label="Advance booking limit"
                value={form.advanceBookingLimitDays}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, advanceBookingLimitDays: e.target.value } : f,
                  )
                }
                options={DAY_OPTIONS}
              />
            </SettingRow>
          </div>
        </Card>

        <Card>
          <FormSection
            title="Cancellation Policy"
            description="Set cancellation windows for class bookings."
          />
          <FormDivider />
          <div className="mt-5">
            <SettingRow
              title="Cancellation Lockout Window"
              description="Minimum hours before class to cancel without penalty"
            >
              <Select
                label=""
                aria-label="Cancellation window"
                value={form.cancellationWindowHours}
                onChange={(e) =>
                  setForm((f) =>
                    f
                      ? { ...f, cancellationWindowHours: e.target.value }
                      : f,
                  )
                }
                options={HOUR_OPTIONS}
              />
            </SettingRow>
          </div>
        </Card>

        <Card>
          <FormSection
            title="Waitlist Settings"
            description="Configure waitlist behavior for full classes."
          />
          <FormDivider />
          <div className="mt-5">
            <Toggle
              label="Enable Waitlist"
              description="Allow members to join a waitlist when a class is full"
              checked={form.waitlistEnabled}
              onChange={(checked) =>
                setForm((f) => (f ? { ...f, waitlistEnabled: checked } : f))
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
