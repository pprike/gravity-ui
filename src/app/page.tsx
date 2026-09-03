"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  CreditCard,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { getDashboardPath } from "@/lib/navigation/config";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { FeatureCard } from "@/components/marketing/FeatureCard";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description:
      "Create recurring class templates, manage coach assignments, and let members book slots — all with configurable booking windows and waitlists.",
  },
  {
    icon: Users,
    title: "Member Management",
    description:
      "Full member profiles with emergency contacts, photo uploads, attendance history, and role-based staff access controls.",
  },
  {
    icon: CreditCard,
    title: "Membership Plans",
    description:
      "Flexible plan types — drop-in, unlimited, multi-location — with subscription tracking and automated renewal reminders.",
  },
  {
    icon: BarChart3,
    title: "Attendance & Reports",
    description:
      "Real-time attendance tracking and downloadable reports give you the insight you need to grow your studio confidently.",
  },
  {
    icon: MessageSquare,
    title: "Class Messaging",
    description:
      "Send targeted messages to an entire class roster in one click — keep members informed about schedule changes or reminders.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Granular permissions for owners, admins, coaches, and receptionists — everyone sees exactly what they need, nothing more.",
  },
];

const STATS = [
  { value: "10k+", label: "Members managed" },
  { value: "500+", label: "Classes per week" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 2 min", label: "Onboarding time" },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(getDashboardPath(user.roles));
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(900px 520px at 15% 10%, rgba(20,184,166,0.15), transparent 55%), radial-gradient(700px 420px at 85% 90%, rgba(15,118,110,0.10), transparent 50%), linear-gradient(160deg, #f7fbfa 0%, #eef6f4 45%, #f4f8f7 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f766e' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
            <Zap className="size-3.5" aria-hidden />
            Built for serious fitness businesses
          </div>

          <h1 className="animate-fade-up text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Run your gym.{" "}
            <span className="text-primary-600">Not spreadsheets.</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
            Gravity is the all-in-one platform for fitness studios — scheduling,
            memberships, attendance, and team management in one beautiful dashboard.
          </p>

          <div className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-control bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-glow"
            >
              Book a free demo
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-control border border-neutral-200 bg-white px-6 py-3 text-base font-semibold text-neutral-700 shadow-soft transition-all hover:border-neutral-300 hover:bg-neutral-50"
            >
              See all features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-neutral-200/60 bg-white">
        <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-y divide-neutral-200/60 md:grid-cols-4 md:divide-y-0">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-8 py-8 text-center">
              <p className="text-3xl font-bold tracking-tight text-primary-600">{value}</p>
              <p className="mt-1 text-sm text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Everything your studio needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-600">
              From first booking to monthly report, Gravity has you covered.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
            >
              Explore all features
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-primary-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to simplify your operations?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join fitness studios that trust Gravity to run their day-to-day.
            No credit card required to get started.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-control bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-soft transition-all hover:bg-primary-50"
            >
              Book a demo
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-control border border-primary-400 px-6 py-3 text-base font-semibold text-white transition-all hover:border-primary-300 hover:bg-primary-500"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
