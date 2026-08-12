"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Dumbbell, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getNavItemsForRoles, getPrimaryRole } from "@/lib/navigation/config";
import { useOrganizationBrand } from "@/lib/shell/use-organization-brand";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const brand = useOrganizationBrand();

  if (!user) return null;

  const navItems = getNavItemsForRoles(user.roles);
  const primaryRole = getPrimaryRole(user.roles);
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const navContent = (
    <>
      <div className="flex w-full items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 p-2">
          <Dumbbell className="size-[18px] text-white" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-white">
            {brand.shortName}
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-primary-600">
            FITNESS
          </p>
        </div>
      </div>

      <nav
        className="flex w-full flex-col gap-1 pt-3"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary-600/10 font-semibold text-primary-600"
                  : "font-medium text-slate-400 hover:text-slate-200",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto w-full border-t border-slate-600 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <span className="mt-0.5 inline-flex rounded bg-primary-600/15 px-1.5 py-0.5 text-[10px] font-bold text-primary-600">
              {primaryRole}
            </span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <LogOut className="size-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-lg border border-neutral-200 bg-white p-2 text-neutral-700 shadow-sm lg:hidden"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-neutral-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col gap-4 border-r border-slate-900 bg-slate-800 px-4 py-6 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
