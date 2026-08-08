"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation/config";

function getPageTitle(pathname: string): string {
  const item = Object.values(NAV_ITEMS).find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`),
  );
  return item?.label ?? "Portal";
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const isSettings = pathname.startsWith("/settings");
  const isMemberships = pathname.startsWith("/memberships");

  if (isMemberships) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={isSettings ? "mb-2" : "mb-6"}>
      <ol className="flex items-center gap-1.5 text-caption text-neutral-500">
        <li>
          <Link href="/dashboard" className="hover:text-neutral-700">
            Home
          </Link>
        </li>
        {pathname !== "/dashboard" && (
          <>
            <li aria-hidden>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li
              className={isSettings ? "text-neutral-500" : "font-medium text-neutral-800"}
              aria-current={isSettings ? undefined : "page"}
            >
              {isSettings ? (
                <Link href="/settings" className="hover:text-neutral-700">
                  {title}
                </Link>
              ) : (
                title
              )}
            </li>
          </>
        )}
      </ol>
      {!isSettings && (
        <h1 className="mt-2 text-h1 text-neutral-900">{title}</h1>
      )}
    </nav>
  );
}
