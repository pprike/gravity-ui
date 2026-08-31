"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  getAppConfiguration,
  getStoreMetadata,
  updateAppConfiguration,
  updateStoreMetadata,
  type AppConfiguration,
  type StoreMetadata,
  type StoreValidationIssue,
} from "@/lib/api/store-metadata";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormDivider, FormSection } from "@/components/ui/FormSection";
import { Input } from "@/components/ui/Input";

interface StoreListingForm {
  appName: string;
  iosBundleId: string;
  androidPackageName: string;
  deepLinkScheme: string;
  supportEmail: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  appStoreTitle: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  keywords: string;
  promotionalText: string;
  screenshotUrls: string;
  featureGraphicUrl: string;
  iconUrl: string;
}

const EMPTY_FORM: StoreListingForm = {
  appName: "",
  iosBundleId: "",
  androidPackageName: "",
  deepLinkScheme: "",
  supportEmail: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  appStoreTitle: "",
  subtitle: "",
  shortDescription: "",
  description: "",
  keywords: "",
  promotionalText: "",
  screenshotUrls: "",
  featureGraphicUrl: "",
  iconUrl: "",
};

function toForm(
  appConfig: AppConfiguration,
  storeMetadata: StoreMetadata,
): StoreListingForm {
  return {
    appName: appConfig.appName ?? "",
    iosBundleId: appConfig.iosBundleId ?? "",
    androidPackageName: appConfig.androidPackageName ?? "",
    deepLinkScheme: appConfig.deepLinkScheme ?? "",
    supportEmail: appConfig.supportEmail ?? "",
    privacyPolicyUrl: appConfig.privacyPolicyUrl ?? "",
    termsUrl: appConfig.termsUrl ?? "",
    appStoreTitle: storeMetadata.appStoreTitle ?? "",
    subtitle: storeMetadata.subtitle ?? "",
    shortDescription: storeMetadata.shortDescription ?? "",
    description: storeMetadata.description ?? "",
    keywords: storeMetadata.keywords ?? "",
    promotionalText: storeMetadata.promotionalText ?? "",
    screenshotUrls: storeMetadata.screenshotUrls.join("\n"),
    featureGraphicUrl: storeMetadata.featureGraphicUrl ?? "",
    iconUrl: storeMetadata.iconUrl ?? "",
  };
}

function parseScreenshotUrls(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function platformLabel(platform: StoreValidationIssue["platform"]): string {
  if (platform === "ios") return "App Store";
  if (platform === "android") return "Google Play";
  return "Both stores";
}

function ValidationPanel({ issues }: { issues: StoreValidationIssue[] }) {
  if (issues.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800">
        Store listing meets current App Store and Google Play requirements.
      </Card>
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <AlertTriangle className="size-4 text-amber-500" />
        Validation feedback
      </div>
      <ul className="space-y-2 text-sm">
        {errors.map((issue) => (
          <li key={`${issue.field}-error-${issue.message}`} className="text-danger-700">
            <span className="font-medium">{platformLabel(issue.platform)}:</span>{" "}
            {issue.message}
          </li>
        ))}
        {warnings.map((issue) => (
          <li key={`${issue.field}-warn-${issue.message}`} className="text-amber-700">
            <span className="font-medium">{platformLabel(issue.platform)}:</span>{" "}
            {issue.message}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function StoreListingSettings() {
  const [form, setForm] = useState<StoreListingForm>(EMPTY_FORM);
  const [validationIssues, setValidationIssues] = useState<StoreValidationIssue[]>([]);
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
        const [appConfig, storeMetadata] = await Promise.all([
          getAppConfiguration(),
          getStoreMetadata(),
        ]);
        if (cancelled) return;
        setForm(toForm(appConfig, storeMetadata));
        setValidationIssues([
          ...appConfig.validationIssues,
          ...storeMetadata.validationIssues,
        ]);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Unable to load store listing settings.",
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

  const charCounts = useMemo(
    () => ({
      appStoreTitle: form.appStoreTitle.length,
      subtitle: form.subtitle.length,
      shortDescription: form.shortDescription.length,
      description: form.description.length,
      keywords: form.keywords.length,
      promotionalText: form.promotionalText.length,
    }),
    [form],
  );

  function updateField<K extends keyof StoreListingForm>(
    key: K,
    value: StoreListingForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(false);
  }

  async function handleSave() {
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      const [appConfig, storeMetadata] = await Promise.all([
        updateAppConfiguration({
          appName: form.appName,
          iosBundleId: form.iosBundleId,
          androidPackageName: form.androidPackageName,
          deepLinkScheme: form.deepLinkScheme,
          supportEmail: form.supportEmail,
          privacyPolicyUrl: form.privacyPolicyUrl,
          termsUrl: form.termsUrl,
        }),
        updateStoreMetadata({
          appStoreTitle: form.appStoreTitle,
          subtitle: form.subtitle,
          shortDescription: form.shortDescription,
          description: form.description,
          keywords: form.keywords,
          promotionalText: form.promotionalText,
          screenshotUrls: parseScreenshotUrls(form.screenshotUrls),
          featureGraphicUrl: form.featureGraphicUrl,
          iconUrl: form.iconUrl,
        }),
      ]);
      setForm(toForm(appConfig, storeMetadata));
      setValidationIssues([
        ...appConfig.validationIssues,
        ...storeMetadata.validationIssues,
      ]);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save store listing settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">App Store Listing</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure branded mobile app identity and store metadata for the build
          pipeline.
        </p>
      </div>

      {error ? (
        <Card className="border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
          {error}
        </Card>
      ) : null}

      {success ? (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Store listing saved.
        </Card>
      ) : null}

      <ValidationPanel issues={validationIssues} />

      <Card className="p-6">
        <FormSection
          title="App identity"
          description="Bundle identifiers and support links used by the mobile app."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="App name"
              value={form.appName}
              onChange={(event) => updateField("appName", event.target.value)}
              placeholder="Gravity Fitness"
            />
            <Input
              label="Deep link scheme"
              value={form.deepLinkScheme}
              onChange={(event) => updateField("deepLinkScheme", event.target.value)}
              placeholder="gravity"
            />
            <Input
              label="iOS bundle ID"
              value={form.iosBundleId}
              onChange={(event) => updateField("iosBundleId", event.target.value)}
              placeholder="com.example.app"
            />
            <Input
              label="Android package name"
              value={form.androidPackageName}
              onChange={(event) =>
                updateField("androidPackageName", event.target.value)
              }
              placeholder="com.example.app"
            />
            <Input
              label="Support email"
              type="email"
              value={form.supportEmail}
              onChange={(event) => updateField("supportEmail", event.target.value)}
            />
            <Input
              label="Privacy policy URL"
              value={form.privacyPolicyUrl}
              onChange={(event) =>
                updateField("privacyPolicyUrl", event.target.value)
              }
            />
            <Input
              label="Terms URL"
              value={form.termsUrl}
              onChange={(event) => updateField("termsUrl", event.target.value)}
            />
          </div>
        </FormSection>

        <FormDivider />

        <FormSection
          title="Store listing"
          description="Titles, descriptions, and asset URLs for App Store Connect and Google Play."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={`Store title (${charCounts.appStoreTitle}/30)`}
              value={form.appStoreTitle}
              onChange={(event) => updateField("appStoreTitle", event.target.value)}
              maxLength={30}
            />
            <Input
              label={`Subtitle (${charCounts.subtitle}/30)`}
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
              maxLength={30}
            />
            <div className="md:col-span-2">
              <Input
                label={`Short description (${charCounts.shortDescription}/80)`}
                value={form.shortDescription}
                onChange={(event) =>
                  updateField("shortDescription", event.target.value)
                }
                maxLength={80}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full description ({charCounts.description}/4000)
              </label>
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                maxLength={4000}
                rows={6}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Input
              label={`Keywords (${charCounts.keywords}/100)`}
              value={form.keywords}
              onChange={(event) => updateField("keywords", event.target.value)}
              maxLength={100}
              placeholder="fitness, gym, classes"
            />
            <Input
              label={`Promotional text (${charCounts.promotionalText}/170)`}
              value={form.promotionalText}
              onChange={(event) =>
                updateField("promotionalText", event.target.value)
              }
              maxLength={170}
            />
            <Input
              label="App icon URL"
              value={form.iconUrl}
              onChange={(event) => updateField("iconUrl", event.target.value)}
            />
            <Input
              label="Feature graphic URL"
              value={form.featureGraphicUrl}
              onChange={(event) =>
                updateField("featureGraphicUrl", event.target.value)
              }
            />
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Screenshot URLs (one per line)
              </label>
              <textarea
                value={form.screenshotUrls}
                onChange={(event) =>
                  updateField("screenshotUrls", event.target.value)
                }
                rows={4}
                placeholder={"https://cdn.example.com/shot1.png\nhttps://cdn.example.com/shot2.png"}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </FormSection>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save store listing"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
