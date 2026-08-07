"use client";

import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { BrandingLoader } from "@/components/branding/BrandingLoader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <BrandingLoader />
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto p-4 lg:p-8">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
