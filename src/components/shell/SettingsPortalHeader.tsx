"use client";

import { Search } from "lucide-react";

interface SettingsPortalHeaderProps {
  eyebrow: string;
  title: string;
}

export function SettingsPortalHeader({
  eyebrow,
  title,
}: SettingsPortalHeaderProps) {
  return (
    <div className="border-b border-neutral-200 pb-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-[28px] font-bold text-slate-800">{title}</h1>
    </div>
  );
}
