import Link from "next/link";
import { Dumbbell, Heart, Zap, Users, ArrowRight } from "lucide-react";

const VALUES = [
  {
    icon: Zap,
    title: "Speed over complexity",
    description:
      "We obsess over the time it takes a receptionist to check in a member or a coach to see tomorrow's class. Every second matters.",
  },
  {
    icon: Heart,
    title: "Built by gym people",
    description:
      "Our team has worked in and with fitness studios. We know the chaos of peak-hour check-ins and last-minute class changes firsthand.",
  },
  {
    icon: Users,
    title: "Community first",
    description:
      "Your members are the reason your studio exists. Gravity is designed to help you serve them better, not just track them.",
  },
];

const MILESTONES = [
  { year: "2021", event: "Founded after one too many scheduling spreadsheets." },
  { year: "2022", event: "First 50 studios onboarded. Multi-location support launched." },
  { year: "2023", event: "Reached 10 000 active members managed on the platform." },
  { year: "2024", event: "Class messaging, audit logs, and role-based access released." },
  { year: "2025", event: "Expanded to international studios across 8 countries." },
];

export const metadata = {
  title: "About – Gravity",
  description: "The story behind Gravity — why we built it and what drives us.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-6 py-20">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(700px 400px at 50% 0%, rgba(20,184,166,0.10), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow">
            <Dumbbell className="size-7" aria-hidden />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-700">
            About Gravity
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            We believe running a gym{" "}
            <span className="text-primary-600">should be simple.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Gravity started because we were tired of watching gym owners juggle
            spreadsheets, WhatsApp groups, and clunky legacy software just to run
            their day. There had to be a better way.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-neutral-200/60 bg-neutral-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Our mission
          </h2>
          <p className="text-lg leading-relaxed text-neutral-700">
            To give fitness studio owners, coaches, and staff the software they
            actually want to use — software that fades into the background and
            lets them focus on what they do best: coaching, connecting, and building
            community.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            What we believe
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-panel border border-neutral-200/80 bg-surface p-6 shadow-card"
              >
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="mb-2 font-semibold text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-neutral-200/60 bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Our journey
          </h2>
          <ol className="relative border-l border-primary-200 pl-8 space-y-8">
            {MILESTONES.map(({ year, event }) => (
              <li key={year} className="relative">
                <span className="absolute -left-[2.125rem] flex size-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-soft">
                  {year.slice(2)}
                </span>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
                  {year}
                </p>
                <p className="text-sm leading-relaxed text-neutral-700">{event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200/60 bg-primary-50 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Come see what we&apos;ve built
        </h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          A 30-minute demo is all it takes to know whether Gravity is the right fit.
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
