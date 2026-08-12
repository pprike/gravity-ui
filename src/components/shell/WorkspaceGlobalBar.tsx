"use client";

import { Bell, ChevronDown, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemberPageHeaderOptional } from "@/components/members/MemberPageHeaderContext";
import { useAuth } from "@/lib/auth/context";
import { getPrimaryRole } from "@/lib/navigation/config";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/members": {
    title: "Members",
    subtitle: "Staff Management & Member Records",
  },
  "/members/new": {
    title: "Add New Member",
    subtitle: "Iron Peak Fitness Staff Portal",
  },
  "/memberships": {
    title: "Memberships",
    subtitle: "Plans, pricing, and billing",
  },
};

interface WorkspaceGlobalBarProps {
  locationLabel?: string;
}

export function WorkspaceGlobalBar({
  locationLabel = "Downtown HQ",
}: WorkspaceGlobalBarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const memberHeader = useMemberPageHeaderOptional()?.header;
  const meta =
    memberHeader ??
    PAGE_META[pathname] ??
    Object.entries(PAGE_META).find(([href]) =>
      pathname.startsWith(`${href}/`) && href !== "/members",
    )?.[1] ?? {
      title: "Workspace",
      subtitle: "",
    };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";
  const roleLabel = user
    ? getPrimaryRole(user.roles).charAt(0) +
      getPrimaryRole(user.roles).slice(1).toLowerCase()
    : "";

  return (
    <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8">
      <div>
        <p className="text-lg font-bold text-slate-900">{meta.title}</p>
        {meta.subtitle ? (
          <p className="text-xs text-slate-500">{meta.subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-1.5 text-[13px] font-semibold text-slate-600"
        >
          <MapPin className="size-3.5 text-primary-600" aria-hidden />
          {locationLabel}
          <ChevronDown className="size-3 text-slate-400" aria-hidden />
        </button>

        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full bg-slate-50 text-slate-600"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-danger-600" />
        </button>

        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500">{roleLabel}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
