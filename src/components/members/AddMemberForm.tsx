"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Calendar, User } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import { listMembershipPlans } from "@/lib/api/membership-plans";
import { createMember } from "@/lib/api/members";
import { updateMemberSubscriptionPlan } from "@/lib/api/member-detail";
import { updateUserProfile, uploadProfileAvatar } from "@/lib/api/profile";
import { formatPlanPrice } from "@/lib/memberships/format";
import type { MembershipPlan } from "@/lib/types/memberships";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormDivider } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface AddMemberFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  planId: string;
  startDate: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
}

const EMPTY_FORM: AddMemberFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  planId: "",
  startDate: new Date().toISOString().slice(0, 10),
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelationship: "",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold uppercase tracking-wide text-primary-600">
      {children}
    </h3>
  );
}

function mapApiFieldErrors(
  details: ApiClientError["details"],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const detail of details ?? []) {
    if (!detail.field || !detail.message) continue;
    if (detail.field === "displayName") {
      errors.firstName = detail.message;
    } else {
      errors[detail.field] = detail.message;
    }
  }
  return errors;
}

export function AddMemberForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AddMemberFormState>(EMPTY_FORM);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loadedPlans = await listMembershipPlans();
        if (cancelled) return;
        const activePlans = loadedPlans.filter((plan) => plan.status === "active");
        setPlans(activePlans);
        setForm((current) => ({
          ...current,
          planId: activePlans[0]?.id ?? "",
        }));
      } catch {
        if (!cancelled) setError("Unable to load membership plans.");
      } finally {
        if (!cancelled) setIsLoadingPlans(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof AddMemberFormState>(
    key: K,
    value: AddMemberFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === "firstName" || key === "lastName") delete next.displayName;
      return next;
    });
    setError("");
  }

  function handleAvatarSelect(file: File) {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required.";
    if (!form.lastName.trim()) errors.lastName = "Last name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.phone.trim()) errors.phone = "Phone number is required.";
    if (!form.planId) errors.planId = "Select a membership plan.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validate()) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    const displayName = [form.firstName, form.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ");

    setIsSaving(true);
    setError("");
    try {
      const created = await createMember({
        email: form.email,
        displayName,
        phone: form.phone,
      });

      try {
        await updateMemberSubscriptionPlan(created.id, form.planId);
      } catch (planError) {
        const planMessage =
          planError instanceof ApiClientError
            ? planError.message
            : "Unable to assign the membership plan.";
        setError(
          `Member was created, but the membership plan could not be assigned: ${planMessage} Open the member profile to assign a plan.`,
        );
        router.push(`/members/${created.id}`);
        return;
      }

      const hasEmergencyContact =
        form.emergencyName.trim() ||
        form.emergencyPhone.trim() ||
        form.emergencyRelationship.trim();

      if (hasEmergencyContact) {
        await updateUserProfile(created.id, {
          displayName,
          phone: form.phone,
          emergencyContact: {
            name: form.emergencyName.trim(),
            phone: form.emergencyPhone.trim(),
            relationship: form.emergencyRelationship.trim(),
          },
        });
      }

      if (avatarFile) {
        await uploadProfileAvatar(created.id, avatarFile);
      }

      router.push("/members");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "CONFLICT") {
          setFieldErrors({ email: err.message });
        } else if (err.details?.length) {
          setFieldErrors(mapApiFieldErrors(err.details));
        }
        setError(err.message);
      } else {
        setError("Unable to create member. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const planOptions = plans.map((plan) => ({
    value: plan.id,
    label: `${plan.name} — ${formatPlanPrice(plan)}`,
  }));

  if (isLoadingPlans) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Card padding="lg" className="space-y-8">
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <section className="space-y-5">
        <SectionHeading>1. Personal Information</SectionHeading>
        <div className="flex items-center gap-6">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <User className="size-6 text-slate-400" />
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleAvatarSelect(file);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </Button>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG up to 2MB</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            placeholder="e.g. Alex"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            error={fieldErrors.firstName}
            showRequired
          />
          <Input
            label="Last Name"
            placeholder="e.g. Rivera"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            error={fieldErrors.lastName}
            showRequired
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. alex.rivera@email.com"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            error={fieldErrors.email}
            showRequired
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. (555) 123-4567"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            error={fieldErrors.phone}
            showRequired
          />
        </div>
      </section>

      <FormDivider />

      <section className="space-y-5">
        <SectionHeading>2. Membership Plan &amp; Billing</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Select Plan"
            options={
              planOptions.length > 0
                ? planOptions
                : [{ value: "", label: "No active plans available" }]
            }
            value={form.planId}
            onChange={(event) => updateField("planId", event.target.value)}
            error={fieldErrors.planId}
            showRequired
            disabled={planOptions.length === 0}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="membership-start-date"
              className="block text-[13px] font-medium text-slate-800"
            >
              Membership Start Date
            </label>
            <div className="relative">
              <input
                id="membership-start-date"
                type="date"
                value={form.startDate}
                onChange={(event) => updateField("startDate", event.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                aria-invalid={Boolean(fieldErrors.startDate)}
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {fieldErrors.startDate && (
              <p className="text-caption text-danger-600" role="alert">
                {fieldErrors.startDate}
              </p>
            )}
          </div>
        </div>
      </section>

      <FormDivider />

      <section className="space-y-5">
        <SectionHeading>3. Emergency Contact</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Contact Name"
            placeholder="Full Name"
            value={form.emergencyName}
            onChange={(event) => updateField("emergencyName", event.target.value)}
          />
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="Phone Number"
            value={form.emergencyPhone}
            onChange={(event) => updateField("emergencyPhone", event.target.value)}
          />
          <Input
            label="Relationship"
            placeholder="e.g. Spouse, Friend"
            value={form.emergencyRelationship}
            onChange={(event) =>
              updateField("emergencyRelationship", event.target.value)
            }
          />
        </div>
      </section>

      <FormDivider />

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/members")}
        >
          Cancel
        </Button>
        <Button type="button" onClick={() => void handleSave()} isLoading={isSaving}>
          Save Member
        </Button>
      </div>
    </Card>
  );
}
