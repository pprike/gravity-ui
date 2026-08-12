"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  getMember,
  normalizeMemberAccountStatus,
  shouldPatchMemberStatus,
  updateMemberStatus,
} from "@/lib/api/members";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
} from "@/lib/api/profile";
import type { MemberAccountStatus } from "@/lib/types/member";
import type { UserProfile } from "@/lib/types/profile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormDivider } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ProfileEditFormProps {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: MemberAccountStatus;
  membershipPlanName: string | null;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
}

function statusOptions(current: MemberAccountStatus) {
  if (current === "invited") {
    return [
      { value: "invited", label: "Pending" },
      { value: "disabled", label: "Inactive" },
    ];
  }

  return [
    { value: "active", label: "Active" },
    { value: "disabled", label: "Inactive" },
  ];
}

function statusHint(current: MemberAccountStatus): string | undefined {
  if (current === "invited") {
    return "Pending members must activate via their invitation link. You can deactivate the account instead.";
  }
  return undefined;
}

function splitDisplayName(displayName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  if (!displayName) return { firstName: "", lastName: "" };
  const parts = displayName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function getProfileFields(profile: UserProfile) {
  if (profile.member) {
    return {
      displayName: profile.member.displayName,
      phone: profile.member.phone,
      avatarUrl: profile.member.avatarUrl,
      emergencyContact: profile.member.emergencyContact,
    };
  }
  if (profile.admin) {
    return {
      displayName: profile.admin.displayName,
      phone: profile.admin.phone,
      avatarUrl: profile.admin.avatarUrl,
      emergencyContact: null,
    };
  }
  if (profile.receptionist) {
    return {
      displayName: profile.receptionist.displayName,
      phone: profile.receptionist.phone,
      avatarUrl: profile.receptionist.avatarUrl,
      emergencyContact: null,
    };
  }
  if (profile.coach) {
    return {
      displayName: null,
      phone: null,
      avatarUrl: profile.coach.avatarUrl,
      emergencyContact: null,
    };
  }
  return {
    displayName: null,
    phone: null,
    avatarUrl: null,
    emergencyContact: null,
  };
}

function profileToForm(
  profile: UserProfile,
  memberStatus: MemberAccountStatus,
  membershipPlanName: string | null,
  memberEmail?: string,
  props?: Pick<ProfileEditFormProps, "firstName" | "lastName" | "email">,
): ProfileForm {
  const fields = getProfileFields(profile);
  const name = splitDisplayName(fields.displayName);
  return {
    firstName: props?.firstName ?? name.firstName,
    lastName: props?.lastName ?? name.lastName,
    email: memberEmail ?? props?.email ?? "",
    phone: fields.phone ?? "",
    status: memberStatus,
    membershipPlanName,
    emergencyName: fields.emergencyContact?.name ?? "",
    emergencyPhone: fields.emergencyContact?.phone ?? "",
    emergencyRelationship: fields.emergencyContact?.relationship ?? "",
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold uppercase tracking-wide text-primary-600">
      {children}
    </h3>
  );
}

export function ProfileEditForm({
  userId,
  email,
  firstName,
  lastName,
}: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [savedStatus, setSavedStatus] = useState<MemberAccountStatus | null>(
    null,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [profile, member] = await Promise.all([
          getUserProfile(userId),
          getMember(userId),
        ]);
        if (cancelled) return;
        const memberStatus = normalizeMemberAccountStatus(member?.status);
        setForm(
          profileToForm(
            profile,
            memberStatus,
            member?.membershipPlanName ?? null,
            member?.email,
            { email, firstName, lastName },
          ),
        );
        setSavedStatus(memberStatus);
        setAvatarUrl(getProfileFields(profile).avatarUrl);
      } catch {
        if (!cancelled) setError("Unable to load profile.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function updateField<K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSuccess(false);
  }

  async function handleAvatarChange(file: File) {
    setIsUploading(true);
    setError("");
    try {
      const updated = await uploadProfileAvatar(userId, file);
      setAvatarUrl(getProfileFields(updated).avatarUrl);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to upload avatar.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    if (!form || savedStatus === null) return;
    setIsSaving(true);
    setError("");
    setSuccess(false);
    const displayName = [form.firstName, form.lastName]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
    const nextStatus = form.status;
    try {
      if (shouldPatchMemberStatus(savedStatus, nextStatus)) {
        await updateMemberStatus(userId, nextStatus);
        setSavedStatus(nextStatus);
      }

      await updateUserProfile(userId, {
        displayName,
        phone: form.phone,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relationship: form.emergencyRelationship,
        },
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save profile.",
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

  const displayTitle = [form.firstName, form.lastName].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <div className="-mx-6 -mt-6 border-b border-neutral-200 bg-white px-8 py-4 lg:-mx-8 lg:-mt-8">
        <h2 className="text-lg font-bold text-slate-900">
          Edit Profile — {displayTitle || "Member"}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Modify member status, personal details, or plans
        </p>
      </div>

      {error && (
        <Card className="border-danger-200 bg-danger-50">
          <p className="text-sm text-danger-700">{error}</p>
        </Card>
      )}
      {success && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-800">Profile saved successfully.</p>
        </Card>
      )}

      <Card padding="lg" className="space-y-8">
        <section className="space-y-5">
          <SectionHeading>1. Personal Information</SectionHeading>
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAvatarChange(file);
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
              >
                Change Photo
              </Button>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG up to 2MB</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              showRequired
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              showRequired
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              readOnly
              className="bg-slate-50 text-slate-500"
              showRequired
            />
            <Input
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              showRequired
            />
          </div>
        </section>

        <FormDivider />

        <section className="space-y-5">
          <SectionHeading>2. Membership Plan &amp; Status</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-slate-900">
                Plan Tier
              </label>
              <div className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-slate-900">
                {form.membershipPlanName ?? "No plan assigned"}
              </div>
            </div>
            <Select
              label="Status"
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as MemberAccountStatus,
                )
              }
              options={statusOptions(savedStatus ?? form.status)}
              hint={statusHint(savedStatus ?? form.status)}
            />
          </div>
        </section>

        <FormDivider />

        <section className="space-y-5">
          <SectionHeading>3. Emergency Contact</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Contact Name"
              value={form.emergencyName}
              onChange={(e) => updateField("emergencyName", e.target.value)}
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={form.emergencyPhone}
              onChange={(e) => updateField("emergencyPhone", e.target.value)}
            />
            <Input
              label="Relationship"
              value={form.emergencyRelationship}
              onChange={(e) =>
                updateField("emergencyRelationship", e.target.value)
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
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
