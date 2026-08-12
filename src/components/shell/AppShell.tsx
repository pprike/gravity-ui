"use client";

import { usePathname } from "next/navigation";
import { MemberPageHeaderProvider } from "@/components/members/MemberPageHeaderContext";
import { Sidebar } from "@/components/shell/Sidebar";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { BrandingLoader } from "@/components/branding/BrandingLoader";
import { DashboardUtilityBar } from "@/components/shell/DashboardTopBar";
import { WorkspaceGlobalBar } from "@/components/shell/WorkspaceGlobalBar";

function useShellLayout(pathname: string) {
  if (pathname.startsWith("/settings")) return "settings" as const;
  if (/^\/members\/[^/]+\/edit/.test(pathname)) return "minimal" as const;
  if (
    pathname === "/members" ||
    pathname === "/members/new" ||
    /^\/members\/[^/]+$/.test(pathname) ||
    pathname === "/memberships"
  ) {
    return "workspace" as const;
  }
  if (pathname === "/dashboard") return "dashboard" as const;
  return "default" as const;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const layout = useShellLayout(pathname);

  return (
    <RouteGuard>
      <BrandingLoader />
      <MemberPageHeaderProvider>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            {layout === "dashboard" && <DashboardUtilityBar />}
            {layout === "workspace" && <WorkspaceGlobalBar />}
            <main
              className={
                layout === "settings"
                  ? "flex-1 overflow-auto p-8"
                  : "flex-1 overflow-auto p-6 lg:p-8"
              }
            >
              {children}
            </main>
          </div>
        </div>
      </MemberPageHeaderProvider>
    </RouteGuard>
  );
}
