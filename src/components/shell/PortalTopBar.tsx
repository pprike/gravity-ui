"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useMemberPageHeaderOptional } from "@/components/members/MemberPageHeaderContext";
import { useAuth } from "@/lib/auth/context";
import {
  canAccessRoute,
  getPrimaryRole,
  NAV_ITEMS,
} from "@/lib/navigation/config";
import { useOrganizationBrand } from "@/lib/shell/use-organization-brand";
import { useWorkspace } from "@/lib/shell/workspace-context";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your studio today",
  },
  "/members": {
    title: "Members",
    subtitle: "Search, profiles, and member records",
  },
  "/members/new": {
    title: "Add New Member",
    subtitle: "Invite a member and assign a plan",
  },
  "/memberships": {
    title: "Memberships",
    subtitle: "Plans, pricing, and billing",
  },
  "/schedule": {
    title: "Schedule",
    subtitle: "Classes, calendar, and rosters",
  },
  "/schedule/new": {
    title: "Create Class",
    subtitle: "Add a class to the calendar",
  },
  "/attendance": {
    title: "Attendance",
    subtitle: "Check-ins, QR scans, and records",
  },
  "/communication": {
    title: "Communication",
    subtitle: "Announcements and class messages",
  },
  "/reports": {
    title: "Reports",
    subtitle: "Revenue, retention, and attendance",
  },
};

interface PortalTopBarProps {
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export function PortalTopBar({
  mobileNavOpen,
  onToggleMobileNav,
}: PortalTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const brand = useOrganizationBrand();
  const memberHeader = useMemberPageHeaderOptional()?.header;
  const {
    locations,
    selectedLocationId,
    selectedLocation,
    setSelectedLocationId,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const meta = useMemo(() => {
    if (memberHeader) return memberHeader;
    if (pathname.includes("/roster")) {
      return { title: "Class Roster", subtitle: "Confirmed attendees and waitlist" };
    }
    if (PAGE_META[pathname]) return PAGE_META[pathname];
    const navMatch = Object.values(NAV_ITEMS).find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    if (navMatch) {
      return { title: navMatch.label, subtitle: navMatch.description ?? "" };
    }
    return { title: "Workspace", subtitle: "" };
  }, [memberHeader, pathname]);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";
  const roleLabel = user
    ? getPrimaryRole(user.roles).charAt(0) +
      getPrimaryRole(user.roles).slice(1).toLowerCase()
    : "";
  const canSearchMembers = user ? canAccessRoute(user.roles, "/members") : false;
  const canOpenSettings = user ? canAccessRoute(user.roles, "/settings") : false;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (locationRef.current && !locationRef.current.contains(target)) {
        setLocationOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    if (canSearchMembers) {
      router.push(`/members?q=${encodeURIComponent(query)}`);
    } else if (user && canAccessRoute(user.roles, "/schedule")) {
      router.push("/schedule");
    }
    setSearchQuery("");
  }

  async function handleSignOut() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-neutral-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-control border border-neutral-200 bg-white p-2 text-neutral-700 shadow-soft transition-colors hover:bg-neutral-50 lg:hidden"
          onClick={onToggleMobileNav}
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileNavOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-neutral-900">
            {meta.title}
          </p>
          {meta.subtitle ? (
            <p className="hidden truncate text-xs text-neutral-500 sm:block">
              {meta.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <form
          onSubmit={handleSearch}
          className="hidden w-56 items-center gap-2 rounded-control border border-neutral-200 bg-neutral-50/80 px-3 py-2 shadow-soft transition-shadow focus-within:border-primary-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 md:flex lg:w-72"
        >
          <Search className="size-4 shrink-0 text-neutral-400" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              canSearchMembers
                ? "Search members..."
                : "Search classes..."
            }
            className="w-full bg-transparent text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            aria-label="Search portal"
          />
        </form>

        {locations.length > 0 ? (
          <div className="relative" ref={locationRef}>
            <button
              type="button"
              className="inline-flex max-w-[160px] items-center gap-2 rounded-control border border-neutral-200 bg-white px-3 py-2 text-[13px] font-medium text-neutral-800 shadow-soft transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-haspopup="listbox"
              aria-expanded={locationOpen}
              onClick={() => setLocationOpen((open) => !open)}
            >
              <MapPin className="size-4 shrink-0 text-primary-600" aria-hidden />
              <span className="truncate">
                {selectedLocation?.name ?? "All locations"}
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-neutral-400" aria-hidden />
            </button>
            {locationOpen ? (
              <ul
                role="listbox"
                className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-panel border border-neutral-200/80 bg-surface py-1 shadow-lift animate-fade-up"
              >
                {locations.map((location) => (
                  <li key={location.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={location.id === selectedLocationId}
                      className={`flex w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                        location.id === selectedLocationId
                          ? "font-semibold text-primary-700"
                          : "text-slate-700"
                      }`}
                      onClick={() => {
                        setSelectedLocationId(location.id);
                        setLocationOpen(false);
                      }}
                    >
                      {location.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            className="rounded-control border border-neutral-200 bg-white p-2 text-neutral-600 shadow-soft transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell className="size-[18px]" />
          </button>
          {notificationsOpen ? (
            <div className="absolute right-0 z-30 mt-2 w-72 rounded-panel border border-neutral-200/80 bg-surface p-4 shadow-lift animate-fade-up">
              <p className="text-sm font-semibold text-neutral-900">Notifications</p>
              <p className="mt-2 text-sm text-neutral-500">
                You&apos;re all caught up. Studio alerts will appear here.
              </p>
              {canOpenSettings ? (
                <Link
                  href="/settings?tab=notifications"
                  className="mt-3 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700"
                  onClick={() => setNotificationsOpen(false)}
                >
                  Notification settings
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {user ? (
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-control p-1 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Account menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((open) => !open)}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800 ring-2 ring-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[13px] font-semibold text-neutral-900">
                  {displayName}
                </p>
                <p className="text-[11px] text-neutral-500">{roleLabel}</p>
              </div>
              <ChevronDown className="hidden size-3.5 text-neutral-400 sm:block" />
            </button>
            {accountOpen ? (
              <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-panel border border-neutral-200/80 bg-surface py-1 shadow-lift animate-fade-up">
                <div className="border-b border-neutral-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-neutral-500">{user.email}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">{brand.name}</p>
                </div>
                {canOpenSettings ? (
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Settings className="size-4" />
                    Settings
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => void handleSignOut()}
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
