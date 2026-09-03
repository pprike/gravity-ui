import Link from "next/link";
import {
  CalendarDays,
  Users,
  CreditCard,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Clock,
  MapPin,
  Bell,
  FileText,
  Repeat,
  ArrowRight,
} from "lucide-react";
import { FeatureCard } from "@/components/marketing/FeatureCard";

const SECTIONS = [
  {
    heading: "Scheduling & Classes",
    description:
      "Give your team the tools to build, manage, and fill classes without the back-and-forth.",
    features: [
      {
        icon: CalendarDays,
        title: "Class Templates",
        description:
          "Define recurring class blueprints — set the schedule, capacity, and coach once, then let Gravity generate sessions automatically.",
      },
      {
        icon: Clock,
        title: "Booking Windows",
        description:
          "Configure how far in advance members can book and how close to the start they can cancel, per plan or per class.",
      },
      {
        icon: Repeat,
        title: "Waitlists",
        description:
          "When a class fills up, members join a waitlist automatically. Cancellations trigger instant notifications to the next in line.",
      },
    ],
  },
  {
    heading: "Members & Staff",
    description:
      "Everything you need to manage your community, from onboarding to daily check-in.",
    features: [
      {
        icon: Users,
        title: "Rich Member Profiles",
        description:
          "Store contact details, emergency contacts, profile photos, and notes — all in one searchable place.",
      },
      {
        icon: ShieldCheck,
        title: "Role-Based Permissions",
        description:
          "Owner, Admin, Coach, and Receptionist roles with fine-grained authority controls so everyone works in their lane.",
      },
      {
        icon: MapPin,
        title: "Multi-Location Access",
        description:
          "Plans can grant access to one location or all of them. Gravity enforces it automatically at check-in and booking.",
      },
    ],
  },
  {
    heading: "Memberships & Billing",
    description:
      "Flexible plan structures that match how modern studios actually operate.",
    features: [
      {
        icon: CreditCard,
        title: "Plan Types",
        description:
          "Create drop-in packs, unlimited monthly plans, or custom multi-location tiers — whatever your business model requires.",
      },
      {
        icon: Bell,
        title: "Renewal Reminders",
        description:
          "Automated notifications keep members informed before their plan expires, reducing churn and awkward conversations.",
      },
      {
        icon: FileText,
        title: "Subscription History",
        description:
          "A full timeline of every plan change and renewal is always one click away for staff and members alike.",
      },
    ],
  },
  {
    heading: "Reports & Communication",
    description:
      "Data and messaging tools that keep your team aligned and your business growing.",
    features: [
      {
        icon: BarChart3,
        title: "Attendance Reports",
        description:
          "Downloadable attendance data per class, per member, or per period — the raw numbers you need without the manual counting.",
      },
      {
        icon: MessageSquare,
        title: "Class Messaging",
        description:
          "Message every member booked into a class in one action. Perfect for last-minute changes or pre-class reminders.",
      },
      {
        icon: ShieldCheck,
        title: "Audit Logs",
        description:
          "Every sensitive action — booking cancellations, plan changes, staff access — is recorded for accountability and compliance.",
      },
    ],
  },
];

export const metadata = {
  title: "Features – Gravity",
  description: "Everything your fitness studio needs in one platform.",
};

export default function FeaturesPage() {
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
            Features
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            One platform. Every workflow.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600">
            Gravity brings together the tools fitness studios rely on, built to
            work together from day one.
          </p>
        </div>
      </section>

      {/* Feature sections */}
      <div className="px-6 pb-24">
        <div className="mx-auto max-w-6xl space-y-20">
          {SECTIONS.map(({ heading, description, features }) => (
            <section key={heading}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {heading}
                </h2>
                <p className="mt-2 max-w-xl text-neutral-600">{description}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="border-t border-neutral-200/60 bg-primary-50 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Want to see it live?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          Book a 30-minute demo and we&apos;ll walk you through the platform with
          your real use case in mind.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-control bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-glow"
        >
          Book a demo
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
