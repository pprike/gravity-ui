"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type FormState = "idle" | "submitting" | "success" | "error";

const STUDIO_SIZES = [
  { value: "", label: "Select studio size…" },
  { value: "solo", label: "Solo trainer / personal studio" },
  { value: "small", label: "1–3 locations, < 100 members" },
  { value: "mid", label: "1–5 locations, 100–500 members" },
  { value: "large", label: "5+ locations / 500+ members" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    studio: "",
    size: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("submitting");

    try {
      await fetch("https://formspree.io/f/placeholder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
      });
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">We'll be in touch!</h1>
        <p className="mt-4 max-w-sm text-neutral-600">
          Thanks for reaching out. We'll follow up within one business day to schedule
          your demo.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-control bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700"
        >
          Back to home
        </Link>
      </div>
    );
  }

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
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-700">
            Contact
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Book a free demo
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-neutral-600">
            Tell us about your studio and we'll show you exactly how Gravity
            fits into your workflow — no sales pressure, no commitments.
          </p>
        </div>
      </section>

      {/* Form + contact info */}
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-panel border border-neutral-200/80 bg-surface p-8 shadow-card space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your name"
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  placeholder="Alex Johnson"
                  required
                />
                <Input
                  label="Work email"
                  name="email"
                  type="email"
                  value={fields.email}
                  onChange={handleChange}
                  placeholder="alex@yourgym.com"
                  required
                />
              </div>

              <Input
                label="Studio / gym name"
                name="studio"
                value={fields.studio}
                onChange={handleChange}
                placeholder="Peak Performance Gym"
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700" htmlFor="size">
                  Studio size
                </label>
                <select
                  id="size"
                  name="size"
                  value={fields.size}
                  onChange={handleChange}
                  className="rounded-control border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-800 shadow-soft focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {STUDIO_SIZES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <Textarea
                label="Anything specific you'd like to cover?"
                name="message"
                value={fields.message}
                onChange={handleChange}
                placeholder="E.g. multi-location memberships, waitlist management, coach permissions…"
                rows={4}
              />

              {formState === "error" && (
                <p className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700">
                  Something went wrong. Please try again or email us directly.
                </p>
              )}

              <Button type="submit" fullWidth isLoading={formState === "submitting"}>
                Send request
              </Button>

              <p className="text-center text-xs text-neutral-400">
                We respond within one business day. No spam, ever.
              </p>
            </form>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-6 lg:col-span-2 lg:pt-2">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink">What to expect</h2>
              <ul className="space-y-2 text-sm text-neutral-600">
                {[
                  "30-minute walkthrough tailored to your studio type",
                  "Live demo with realistic data — no slide decks",
                  "Q&A on your specific workflows",
                  "Transparent pricing — no surprises",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-panel border border-neutral-200/80 bg-white p-5 shadow-card space-y-3">
              <p className="text-sm font-semibold text-ink">Or reach us directly</p>
              <a
                href="mailto:hello@gravityfitness.io"
                className="flex items-center gap-2.5 text-sm text-neutral-600 transition-colors hover:text-primary-700"
              >
                <Mail className="size-4 text-primary-600" />
                hello@gravityfitness.io
              </a>
              <a
                href="tel:+18005550199"
                className="flex items-center gap-2.5 text-sm text-neutral-600 transition-colors hover:text-primary-700"
              >
                <Phone className="size-4 text-primary-600" />
                +1 800 555 0199
              </a>
            </div>

            <div className="rounded-panel border border-primary-100 bg-primary-50 p-5">
              <p className="mb-1 text-sm font-semibold text-primary-800">
                Already a customer?
              </p>
              <p className="mb-3 text-sm text-primary-700">
                Sign in to access your dashboard or contact support.
              </p>
              <Link
                href="/login"
                className="text-sm font-semibold text-primary-700 underline-offset-2 hover:underline"
              >
                Go to sign in →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
