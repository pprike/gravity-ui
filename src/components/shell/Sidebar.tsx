"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Dumbbell, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { getNavItemsForRoles, getPrimaryRole } from "@/lib/navigation/config";
import { useOrganizationBrand } from "@/lib/shell/use-organization-brand";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const brand = useOrganizationBrand();

  if (!user) return null;

  const navItems = getNavItemsForRoles(user.roles);
  const primaryRole = getPrimaryRole(user.roles);
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const navContent = (
    <>
      <div className="flex w-full items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 shadow-glow">
          <Dumbbell className="size-5 text-white" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-lg font-semibold tracking-tight text-white">
            {brand.shortName}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-300/90">
            Fitness
          </p>
        </div>
      </div>

      <nav
        className="flex w-full flex-col gap-1 pt-4"
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
              onClick={() => onMobileOpenChange(false)}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-white/10 font-semibold text-white shadow-soft ring-1 ring-white/10"
                  : "font-medium text-slate-400 hover:bg-white/5 hover:text-slate-100",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={clsx(
                  "size-5 shrink-0 transition-colors",
                  isActive ? "text-primary-300" : "text-slate-500 group-hover:text-slate-300",
                )}
                aria-hidden
              />
              <span>{item.label}</span>
              {isActive ? (
                <span className="ml-auto size-1.5 rounded-full bg-primary-400" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto w-full border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 ring-1 ring-white/5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-semibold text-primary-200 ring-1 ring-primary-400/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <span className="mt-0.5 inline-flex rounded-md bg-primary-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-300">
              {primaryRole}
            </span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-white"
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
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/50 backdrop-blur-[2px] lg:hidden animate-fade-in"
          onClick={() => onMobileOpenChange(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-4 border-r border-white/5 bg-ink px-4 py-6 shadow-lift transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(500px 280px at 20% -10%, rgba(20,184,166,0.22), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col gap-4">{navContent}</div>
      </aside>
    </>
  );
}
