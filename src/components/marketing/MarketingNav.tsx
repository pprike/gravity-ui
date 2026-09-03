"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Menu, X } from "lucide-react";
import { clsx } from "clsx";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink hover:text-primary-700 transition-colors"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-soft">
            <Dumbbell className="size-4" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">Gravity</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "rounded-control px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-ink",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-control px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-control bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-glow"
          >
            Book a demo
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-control p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-neutral-200/60 bg-white px-6 pb-6 md:hidden">
          <nav className="mt-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-control px-3 py-2 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-control border border-neutral-200 px-4 py-2.5 text-center text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Sign in
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="rounded-control bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-primary-700"
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
