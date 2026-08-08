"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { clsx } from "clsx";
import { ApiClientError } from "@/lib/api/client";
import {
  createMembershipPlan,
  getMembershipPlan,
  updateMembershipPlan,
} from "@/lib/api/membership-plans";
import { getOrganization } from "@/lib/api/organization";
import { inferPlanType } from "@/lib/memberships/format";
import type {
  BillingInterval,
  MembershipPlan,
  PlanType,
} from "@/lib/types/memberships";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";

const STEPS = [
  { title: "Basics", subtitle: "Plan details & type" },
  { title: "Pricing", subtitle: "Billing & intervals" },
  { title: "Rules", subtitle: "Access & limitations" },
];

const PLAN_TYPES: Array<{
  id: PlanType;
  title: string;
  description: string;
}> = [
  {
    id: "recurring",
    title: "Recurring Membership",
    description: "Billed on a subscription basis",
  },
  {
    id: "class_pack",
    title: "Class Pack",
    description: "Pre-paid block of class credits",
  },
  {
    id: "drop_in",
    title: "Drop-in Pass",
    description: "Single entry or single class credit",
  },
];

interface WizardForm {
  name: string;
  description: string;
  planType: PlanType;
  publicVisibility: boolean;
  price: string;
  currency: string;
  billingInterval: BillingInterval;
  classCredits: string;
  unlimitedCredits: boolean;
  status: "active" | "inactive";
}

const EMPTY_FORM: WizardForm = {
  name: "",
  description: "",
  planType: "recurring",
  publicVisibility: true,
  price: "",
  currency: "USD",
  billingInterval: "monthly",
  classCredits: "12",
  unlimitedCredits: true,
  status: "inactive",
};

interface PlanWizardProps {
  planId?: string;
}

function planToForm(plan: MembershipPlan): WizardForm {
  const planType = inferPlanType(plan);
  return {
    name: plan.name,
    description: plan.description ?? "",
    planType,
    publicVisibility: true,
    price: (plan.priceCents / 100).toString(),
    currency: plan.currency,
    billingInterval: plan.billingInterval,
    classCredits: plan.classCredits?.toString() ?? "12",
    unlimitedCredits: plan.classCredits == null,
    status: plan.status,
  };
}

function resolveClassCredits(form: WizardForm): number | null {
  if (form.planType === "drop_in") return 1;
  if (form.planType === "recurring" && form.unlimitedCredits) return null;
  const parsed = Number.parseInt(form.classCredits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function PlanWizard({ planId }: PlanWizardProps) {
  const router = useRouter();
  const isEditing = Boolean(planId);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(EMPTY_FORM);
  const [subtitle, setSubtitle] = useState("");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const org = await getOrganization().catch(() => null);
        if (!cancelled && org) setSubtitle(org.name);
        if (planId) {
          const plan = await getMembershipPlan(planId);
          if (!cancelled) setForm(planToForm(plan));
        }
      } catch {
        if (!cancelled) setError("Unable to load plan details.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planId]);

  function updateField<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setError("");
  }

  function validateStep(currentStep: number): boolean {
    const errors: Record<string, string> = {};
    if (currentStep === 0 && !form.name.trim()) {
      errors.name = "Plan name is required.";
    }
    if (currentStep === 1) {
      const price = Number.parseFloat(form.price);
      if (!Number.isFinite(price) || price < 0) {
        errors.price = "Enter a valid price.";
      }
    }
    if (currentStep === 2 && form.planType === "class_pack" && !form.unlimitedCredits) {
      const credits = Number.parseInt(form.classCredits, 10);
      if (!Number.isFinite(credits) || credits < 1) {
        errors.classCredits = "Enter a valid number of credits.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleSave(asDraft: boolean) {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    const priceCents = Math.round(Number.parseFloat(form.price) * 100);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      priceCents,
      currency: form.currency,
      billingInterval: form.billingInterval,
      classCredits: resolveClassCredits(form),
      status: (asDraft ? "inactive" : form.status) as "active" | "inactive",
    };

    setIsSaving(true);
    setError("");
    try {
      if (isEditing && planId) {
        await updateMembershipPlan(planId, payload);
      } else {
        await createMembershipPlan(payload);
      }
      router.push("/memberships");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save membership plan.",
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

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Edit Membership Plan" : "Create Membership Plan"}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleSave(true)}
          isLoading={isSaving}
        >
          Save as Draft
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {STEPS.map((s, index) => (
            <div key={s.title} className="flex min-w-[140px] flex-1 items-center gap-3">
              <div
                className={clsx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                  index < step
                    ? "border-primary-600 bg-primary-600 text-white"
                    : index === step
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {index < step ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div>
                <p
                  className={clsx(
                    "text-sm font-bold",
                    index <= step ? "text-primary-600" : "text-slate-800",
                  )}
                >
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500">{s.subtitle}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="hidden h-px flex-1 bg-slate-200 lg:block" />
              )}
            </div>
          ))}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <Card className="border-danger-200 bg-danger-50">
          <p className="text-sm text-danger-700">{error}</p>
        </Card>
      )}

      <Card padding="lg" className="space-y-6">
        {step === 0 && (
          <>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Step 1: Basics & Configuration
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Define the primary details, type, and visibility of this new
                membership plan.
              </p>
            </div>
            <Input
              label="Plan Name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Platinum All-Access Monthly"
              showRequired
              error={fieldErrors.name}
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Provide a clear description of what is included in this plan..."
              rows={4}
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                Plan Type <span className="text-danger-600">*</span>
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {PLAN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateField("planType", type.id)}
                    className={clsx(
                      "rounded-xl border p-4 text-left transition-colors",
                      form.planType === type.id
                        ? "border-primary-600 bg-primary-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={clsx(
                          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
                          form.planType === type.id
                            ? "border-primary-600"
                            : "border-slate-400",
                        )}
                      >
                        {form.planType === type.id && (
                          <span className="h-2 w-2 rounded-full bg-primary-600" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {type.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <Toggle
              label="Public Visibility"
              description="When enabled, this plan is purchasable directly by members via the client mobile app."
              checked={form.publicVisibility}
              onChange={(checked) => updateField("publicVisibility", checked)}
            />
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Step 2: Pricing & Billing
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Set the price, currency, and billing interval for this plan.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="49.00"
                showRequired
                error={fieldErrors.price}
              />
              <Select
                label="Currency"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                options={[{ value: "USD", label: "USD" }]}
              />
            </div>
            <Select
              label="Billing Interval"
              value={form.billingInterval}
              onChange={(e) =>
                updateField("billingInterval", e.target.value as BillingInterval)
              }
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Annual" },
              ]}
              showRequired
            />
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Step 3: Access & Limitations
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Configure class credits and plan availability.
              </p>
            </div>
            {form.planType !== "drop_in" && (
              <>
                {form.planType === "recurring" && (
                  <Toggle
                    label="Unlimited class access"
                    description="Members can book unlimited classes during each billing period."
                    checked={form.unlimitedCredits}
                    onChange={(checked) =>
                      updateField("unlimitedCredits", checked)
                    }
                  />
                )}
                {(!form.unlimitedCredits || form.planType === "class_pack") && (
                  <Input
                    label="Class Credits"
                    type="number"
                    min="1"
                    value={form.classCredits}
                    onChange={(e) => updateField("classCredits", e.target.value)}
                    error={fieldErrors.classCredits}
                  />
                )}
              </>
            )}
            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value as "active" | "inactive")
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Draft" },
              ]}
            />
          </>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() =>
              step === 0 ? router.push("/memberships") : setStep((s) => s - 1)
            }
            className="text-sm font-semibold text-slate-500 underline hover:text-slate-700"
          >
            {step === 0 ? "Cancel and exit" : "Previous step"}
          </button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleSave(false)}
              isLoading={isSaving}
            >
              {isEditing ? "Save Plan" : "Publish Plan"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
