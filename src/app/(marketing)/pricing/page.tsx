import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PricingCard } from "@/components/marketing/PricingCard";

const PLANS = [
  {
    tier: "Starter",
    price: "$79",
    description: "Perfect for independent studios and boutique gyms just getting started.",
    features: [
      "Up to 200 active members",
      "1 location",
      "Class scheduling & booking",
      "Member profiles",
      "Attendance tracking",
      "Email support",
    ],
    cta: "Book a demo",
    ctaHref: "/contact",
  },
  {
    tier: "Pro",
    price: "$199",
    description: "For growing studios that need more power, more locations, and more insight.",
    features: [
      "Up to 1 000 active members",
      "Up to 5 locations",
      "Everything in Starter",
      "Multi-location membership plans",
      "Class messaging",
      "Advanced reports & exports",
      "Priority support",
    ],
    cta: "Book a demo",
    ctaHref: "/contact",
    highlighted: true,
    badge: "Most popular",
  },
  {
    tier: "Enterprise",
    price: "Custom",
    description: "Tailored for large gym chains, franchise operators, and high-volume studios.",
    features: [
      "Unlimited members",
      "Unlimited locations",
      "Everything in Pro",
      "Custom roles & permissions",
      "Audit logs & compliance",
      "Dedicated onboarding",
      "SLA-backed uptime guarantee",
      "Custom integrations",
    ],
    cta: "Contact us",
    ctaHref: "/contact",
  },
];

const FAQ = [
  {
    q: "Is there a free trial?",
    a: "We offer a guided demo so you can see the platform with your real data before committing. No credit card required.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes — you can upgrade or downgrade at any time. Changes take effect at the next billing cycle.",
  },
  {
    q: "What counts as an active member?",
    a: "Any member with at least one active or recently expired subscription in the past 30 days.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes. Annual plans receive two months free compared to monthly billing. Ask us during the demo.",
  },
];

export const metadata = {
  title: "Pricing – Gravity",
  description: "Simple, transparent pricing for fitness studios of every size.",
};

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden bg-white px-6 py-20 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(700px 400px at 50% 0%, rgba(20,184,166,0.10), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-700">
            Pricing
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Straightforward pricing
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600">
            No hidden fees, no per-seat surprises. Pick the plan that fits your studio
            and scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.tier} {...plan} />
          ))}
        </div>
      </section>

      {/* Feature comparison note */}
      <section className="border-y border-neutral-200/60 bg-neutral-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-ink">
            All plans include
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "SSL-secured data",
              "Automatic backups",
              "Mobile-friendly interface",
              "Demo mode for onboarding",
              "API access",
              "Regular feature updates",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-neutral-700">
                <Check className="size-4 shrink-0 text-primary-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-panel border border-neutral-200/80 bg-surface p-6 shadow-card"
              >
                <p className="mb-2 font-semibold text-ink">{q}</p>
                <p className="text-sm leading-relaxed text-neutral-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200/60 bg-primary-600 px-6 py-16 text-center text-white">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Still have questions?
        </h2>
        <p className="mt-3 text-primary-100">
          Talk to us — we&apos;re happy to help you find the right fit.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-control bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-soft transition-all hover:bg-primary-50"
        >
          Get in touch
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
