import Link from "next/link";
import { Dumbbell } from "lucide-react";

const LINKS = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Book a demo" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  Platform: [
    { href: "/login", label: "Sign in" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 text-ink">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-soft">
                <Dumbbell className="size-4" aria-hidden />
              </span>
              <span className="text-lg font-semibold tracking-tight">Gravity</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
              The all-in-one management platform built for modern fitness studios and gyms.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {group}
              </p>
              <ul className="space-y-2">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-600 transition-colors hover:text-primary-700"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} Gravity Fitness Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
