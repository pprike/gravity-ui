"use client";

import { Bell, Search } from "lucide-react";

interface SettingsPortalHeaderProps {
  eyebrow: string;
  title: string;
}

export function SettingsPortalHeader({
  eyebrow,
  title,
}: SettingsPortalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 pb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-[28px] font-bold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex w-[220px] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
          <Search className="size-4 text-slate-500" aria-hidden />
          <span className="text-[13px] text-slate-500">Search admin portal...</span>
        </div>
        <button
          type="button"
          className="rounded-lg border border-neutral-200 bg-white p-2 text-slate-600"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
