import type { BillingInterval, MembershipPlan, PlanType } from "@/lib/types/memberships";

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatBillingInterval(interval: BillingInterval): string {
  if (interval === "weekly") return "Weekly";
  if (interval === "yearly") return "Annual";
  return "Monthly";
}

export function formatPlanInterval(plan: MembershipPlan): string {
  if (
    plan.classCredits === 1 &&
    (plan.name.toLowerCase().includes("drop") ||
      inferPlanType(plan) === "drop_in")
  ) {
    return "Per Class";
  }
  return formatBillingInterval(plan.billingInterval);
}

export function formatPlanPrice(plan: MembershipPlan): string {
  const price = formatPrice(plan.priceCents, plan.currency);
  if (plan.classCredits === 1 && plan.name.toLowerCase().includes("drop")) {
    return `${price}/class`;
  }
  if (plan.billingInterval === "yearly") return `${price}/yr`;
  if (plan.billingInterval === "weekly") return `${price}/wk`;
  return `${price}/mo`;
}

export function formatCredits(plan: MembershipPlan): string {
  if (plan.classCredits == null) return "Unlimited";
  if (plan.classCredits === 1) return "1 credit";
  return `${plan.classCredits} classes`;
}

export function inferPlanType(plan: MembershipPlan): PlanType {
  if (plan.classCredits === 1) return "drop_in";
  if (plan.classCredits != null) return "class_pack";
  return "recurring";
}

export function planStatusLabel(status: MembershipPlan["status"]): string {
  return status === "active" ? "Active" : "Draft";
}

export function formatPlanLocations(
  locationIds: string[],
  locations: Array<{ id: string; name: string }>,
): string {
  if (locationIds.length === 0) return "All locations";
  const names = locations
    .filter((location) => locationIds.includes(location.id))
    .map((location) => location.name);
  return names.length > 0 ? names.join(", ") : "All locations";
}
