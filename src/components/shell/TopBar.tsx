"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { getPrimaryRole } from "@/lib/navigation/config";
import { Button } from "@/components/ui/Button";

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const roleLabel =
    getPrimaryRole(user.roles).charAt(0) +
    getPrimaryRole(user.roles).slice(1).toLowerCase();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-8">
      <div className="pl-12 lg:pl-0">
        <p className="text-sm font-medium text-neutral-900">{displayName}</p>
        <p className="text-caption text-neutral-500">{roleLabel}</p>
      </div>
      <Button variant="tertiary" onClick={handleLogout}>
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </Button>
    </header>
  );
}
