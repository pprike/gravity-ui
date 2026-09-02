"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MemberPageHeaderProvider } from "@/components/members/MemberPageHeaderContext";
import { Sidebar } from "@/components/shell/Sidebar";
import { PortalTopBar } from "@/components/shell/PortalTopBar";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { BrandingLoader } from "@/components/branding/BrandingLoader";
import { WorkspaceProvider } from "@/lib/shell/workspace-context";

function useShowTopBar(pathname: string) {
  if (/^\/members\/[^/]+\/edit/.test(pathname)) return false;
  return true;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTopBar = useShowTopBar(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RouteGuard>
      <BrandingLoader />
      <WorkspaceProvider>
        <MemberPageHeaderProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-700 focus:shadow"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar
              mobileOpen={mobileNavOpen}
              onMobileOpenChange={setMobileNavOpen}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              {showTopBar ? (
                <PortalTopBar
                  mobileNavOpen={mobileNavOpen}
                  onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
                />
              ) : null}
              <main
                id="main-content"
                className="flex-1 overflow-auto p-6 lg:p-8"
              >
                {children}
              </main>
            </div>
          </div>
        </MemberPageHeaderProvider>
      </WorkspaceProvider>
    </RouteGuard>
  );
}
