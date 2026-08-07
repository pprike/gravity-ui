"use client";

import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { getOrganization, updateOrganization } from "@/lib/api/organization";
import { buildSettingsUpdate, getSettingValue } from "@/lib/settings/values";
import { TIMEZONE_OPTIONS } from "@/lib/settings/timezones";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormDivider, FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface OrganizationForm {
  name: string;
  slug: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  corporateAddress: string;
}

export function OrganizationSettingsForm() {
  const [form, setForm] = useState<OrganizationForm>({
    name: "",
    slug: "",
    timezone: "America/New_York",
    contactEmail: "",
    contactPhone: "",
    corporateAddress: "",
  });
  const [initialForm, setInitialForm] = useState<OrganizationForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const org = await getOrganization();
        if (cancelled) return;
        const loaded: OrganizationForm = {
          name: org.name,
          slug: org.slug,
          timezone:
            getSettingValue<string>(org.settings, "timezone") ?? "America/New_York",
          contactEmail:
            getSettingValue<string>(org.settings, "contactEmail") ?? "",
          contactPhone:
            getSettingValue<string>(org.settings, "contactPhone") ?? "",
          corporateAddress:
            getSettingValue<string>(org.settings, "corporateAddress") ?? "",
        };
        setForm(loaded);
        setInitialForm(loaded);
      } catch {
        if (!cancelled) setError("Unable to load organization details.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof OrganizationForm>(
    key: K,
    value: OrganizationForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const isDirty =
    initialForm !== null &&
    JSON.stringify(form) !== JSON.stringify(initialForm);

  async function handleSave() {
    setIsSaving(true);
    setError("");
    setFieldErrors({});
    setSuccess(false);

    try {
      const updated = await updateOrganization({
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        settings: buildSettingsUpdate({
          timezone: form.timezone,
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim(),
          corporateAddress: form.corporateAddress.trim(),
        }),
      });
      const loaded: OrganizationForm = {
        name: updated.name,
        slug: updated.slug,
        timezone:
          getSettingValue<string>(updated.settings, "timezone") ??
          form.timezone,
        contactEmail:
          getSettingValue<string>(updated.settings, "contactEmail") ?? "",
        contactPhone:
          getSettingValue<string>(updated.settings, "contactPhone") ?? "",
        corporateAddress:
          getSettingValue<string>(updated.settings, "corporateAddress") ?? "",
      };
      setForm(loaded);
      setInitialForm(loaded);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        const errors: Record<string, string> = {};
        for (const detail of err.details) {
          if (detail.field) errors[detail.field] = detail.message;
        }
        setFieldErrors(errors);
      }
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save organization details.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (initialForm) setForm(initialForm);
    setFieldErrors({});
    setError("");
    setSuccess(false);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-7">
        <FormSection
          title="Profile Information"
          description="Configure your brand identity and centralized point of contact."
        />
        <FormDivider />

        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Organization Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            error={fieldErrors.name}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            hint={`Your public namespace: gravity.fit/${form.slug || "your-org"}`}
            error={fieldErrors.slug}
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => updateField("timezone", e.target.value)}
            options={TIMEZONE_OPTIONS}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Contact Phone"
            type="tel"
            value={form.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
          />
          <Input
            label="Corporate Address"
            value={form.corporateAddress}
            onChange={(e) => updateField("corporateAddress", e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700">
            Organization details saved successfully.
          </p>
        )}

        <FormDivider />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!isDirty || isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}
