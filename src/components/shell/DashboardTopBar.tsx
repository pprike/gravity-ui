"use client";

import { Bell, ChevronDown, MapPin, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation/config";

function getPageTitle(pathname: string): string {
  const item = Object.values(NAV_ITEMS).find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`),
  );
  return item?.label ?? "Dashboard";
}

export function DashboardTopBar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-[13px]"
      >
        <span className="font-medium text-slate-500">Staff Portal</span>
        <span className="text-slate-400">/</span>
        <span className="font-semibold text-slate-800">{pageTitle}</span>
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex w-60 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
          <Search className="size-4 text-slate-400" aria-hidden />
          <span className="text-[13px] text-slate-400">
            Search members, classes...
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg bg-slate-100 p-2.5 text-slate-600"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 p-1.5"
          aria-label="Account menu"
        >
          <div className="size-7 rounded-[14px] bg-slate-300" />
          <ChevronDown className="size-3.5 text-slate-500" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function DashboardUtilityBar() {
  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8">
      <div className="flex w-80 items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
        <Search className="size-4 text-neutral-400" aria-hidden />
        <span className="text-[13px] text-neutral-400">
          Search member, class, report...
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] font-medium text-neutral-800"
        >
          <MapPin className="size-4 text-neutral-500" aria-hidden />
          Iron Peak Downtown
          <ChevronDown className="size-3.5 text-neutral-400" aria-hidden />
        </button>
        <button
          type="button"
          className="relative rounded-lg bg-neutral-50 p-2 text-neutral-600"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-danger-600" />
        </button>
        <div className="size-9 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}
