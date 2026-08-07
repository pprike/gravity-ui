"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Upload, Zap } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import { getBranding, updateBranding, uploadLogo } from "@/lib/api/branding";
import { applyBrandingToDocument } from "@/lib/branding/apply";
import { getOrganization } from "@/lib/api/organization";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormDivider, FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";

const COLOR_PRESETS = [
  "#0d9488",
  "#7c3aed",
  "#2563eb",
  "#db2777",
  "#16a34a",
];

const DEFAULT_BRANDING = {
  primaryColor: "#0d9488",
  accentColor: "#14b8a6",
  fontFamily: "Inter, system-ui, sans-serif",
  applicationTitle: "Gravity Fitness",
  logoUrl: null as string | null,
};

interface BrandingForm {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  applicationTitle: string;
  logoUrl: string | null;
  logoFileName: string | null;
}

export function BrandingSettings() {
  const [form, setForm] = useState<BrandingForm>({
    ...DEFAULT_BRANDING,
    logoFileName: null,
  });
  const [initialForm, setInitialForm] = useState<BrandingForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [branding, org] = await Promise.all([
          getBranding(),
          getOrganization(),
        ]);
        if (cancelled) return;
        const loaded: BrandingForm = {
          primaryColor: branding.primaryColor ?? DEFAULT_BRANDING.primaryColor,
          accentColor: branding.accentColor ?? DEFAULT_BRANDING.accentColor,
          fontFamily: branding.fontFamily ?? DEFAULT_BRANDING.fontFamily,
          applicationTitle: org.name,
          logoUrl: branding.logoUrl,
          logoFileName: branding.logoUrl ? "organization-logo.png" : null,
        };
        setForm(loaded);
        setInitialForm(loaded);
        applyBrandingToDocument(loaded);
      } catch {
        if (!cancelled) setError("Unable to load branding settings.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty =
    initialForm !== null &&
    JSON.stringify(form) !== JSON.stringify(initialForm);

  async function handleSave() {
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = await updateBranding({
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        fontFamily: form.fontFamily,
      });
      const next: BrandingForm = {
        ...form,
        primaryColor: updated.primaryColor ?? form.primaryColor,
        accentColor: updated.accentColor ?? form.accentColor,
        fontFamily: updated.fontFamily ?? form.fontFamily,
        logoUrl: updated.logoUrl ?? form.logoUrl,
      };
      setForm(next);
      setInitialForm(next);
      applyBrandingToDocument(next);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save branding.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    if (!initialForm) return;
    setForm({
      ...DEFAULT_BRANDING,
      applicationTitle: initialForm.applicationTitle,
      logoUrl: initialForm.logoUrl,
      logoFileName: initialForm.logoFileName,
    });
    setSuccess(false);
    setError("");
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError("");
    try {
      const logoUrl = await uploadLogo(file);
      setForm((f) => ({
        ...f,
        logoUrl,
        logoFileName: file.name,
      }));
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Unable to upload logo.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
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
    <div className="grid gap-8 xl:grid-cols-[1fr_480px]">
      <Card className="p-8">
        <div className="space-y-7">
          <FormSection
            title="Brand Customization"
            description="Incorporate your specific visual markers across Gravity portals."
          />
          <FormDivider />

          <div>
            <p className="mb-2 text-[13px] font-medium text-slate-800">Brand Logo</p>
            <div className="flex items-center gap-4 rounded-lg border border-dashed border-primary-600 bg-slate-50 p-5">
              <div
                className="flex h-[50px] w-[50px] items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: form.primaryColor }}
              >
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoUrl}
                    alt=""
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <Zap className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {form.logoFileName ?? "No logo uploaded"}
                </p>
                <p className="text-xs text-slate-500">
                  {form.logoUrl ? "PNG, JPG, SVG or WebP" : "Upload your organization logo"}
                </p>
              </div>
              <label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="sr-only"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                />
                <span className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  {isUploading ? "Uploading…" : "Replace"}
                </span>
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-slate-800">
              Primary Palette Accent
            </p>
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 shrink-0 rounded-lg border border-slate-200"
                style={{ backgroundColor: form.primaryColor }}
              />
              <Input
                label=""
                aria-label="Primary color hex value"
                value={form.primaryColor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, primaryColor: e.target.value }))
                }
                className="flex-1"
              />
              <div className="flex gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, primaryColor: color }))}
                    className={`h-6 w-6 rounded-full border-2 ${
                      form.primaryColor.toLowerCase() === color
                        ? "border-slate-800"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set primary color to ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Input
            label="Application Title"
            value={form.applicationTitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, applicationTitle: e.target.value }))
            }
            required
          />

          {error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700">
              Branding saved successfully.
            </p>
          )}

          <FormDivider />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!isDirty}
            >
              Save Branding
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <p className="text-base font-semibold text-slate-800">
          Live Device &amp; Portal Previews
        </p>
        <BrandingPreview form={form} />
      </div>
    </div>
  );
}

function BrandingPreview({ form }: { form: BrandingForm }) {
  return (
    <div className="flex gap-4">
      <div className="w-[220px] overflow-hidden rounded-[28px] border-8 border-slate-800 bg-white">
        <div className="flex justify-center pt-1">
          <div className="h-3 w-12 rounded-full bg-slate-800" />
        </div>
        <div className="space-y-4 p-3">
          <div className="flex items-center justify-between">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md text-white"
              style={{ backgroundColor: form.primaryColor }}
            >
              <Zap className="h-3 w-3" />
            </div>
            <div className="h-4 w-4 rounded-full bg-slate-200" />
          </div>
          <div
            className="space-y-2 rounded-xl p-3 text-white"
            style={{ backgroundColor: form.primaryColor }}
          >
            <p className="text-sm font-bold">SUMMER SHRED</p>
            <p className="text-[11px] opacity-90">
              20% off all coaching packages this week.
            </p>
            <span className="inline-block rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-primary-600">
              Get Offer
            </span>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-slate-800">Daily Workouts</p>
            <div className="rounded-lg border border-slate-200 p-2">
              <div className="h-8 w-full rounded-md bg-slate-100" />
              <p className="mt-2 text-[11px] font-semibold text-slate-800">
                Full-Body Ignite
              </p>
              <p className="text-[10px] text-slate-500">09:00 AM · Downtown</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-slate-900 p-3">
        <div className="mb-4 flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md text-white"
            style={{ backgroundColor: form.primaryColor }}
          >
            <Zap className="h-3 w-3" />
          </div>
          <p className="text-xs font-bold text-white">{form.applicationTitle}</p>
        </div>
        <div className="space-y-1">
          <div
            className="flex items-center gap-2 rounded-md px-2 py-2 text-[11px] font-semibold text-white"
            style={{ backgroundColor: form.primaryColor }}
          >
            <ImageIcon className="h-3 w-3" />
            Settings
          </div>
          <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[11px] text-slate-400">
            Members
          </div>
          <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[11px] text-slate-400">
            Schedule
          </div>
        </div>
      </div>
    </div>
  );
}
