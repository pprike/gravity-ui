"use client";

import Link from "next/link";
import { Calendar, Mail, MapPin, Pencil, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  classTypeStyles,
  formatSessionDateTime,
  inferClassType,
} from "@/lib/schedule/format";
import type { ClassSession } from "@/lib/types/schedule";

interface ClassDetailPanelProps {
  session: ClassSession;
  onClose: () => void;
}

export function ClassDetailPanel({ session, onClose }: ClassDetailPanelProps) {
  const type = inferClassType(session.name);
  const styles = classTypeStyles(type);
  const waitlist = session.waitlistCount ?? 0;

  return (
    <aside className="flex h-full flex-col bg-white">
      <div className="flex items-start justify-between gap-3 px-5 py-5">
        <div>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}
          >
            {styles.label}
          </span>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{session.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close class details"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-auto px-5 pb-5">
        {session.description ? (
          <p className="text-sm leading-6 text-slate-600">{session.description}</p>
        ) : null}

        <dl className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-4 text-slate-400" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Coach
              </dt>
              <dd>{session.coachName ?? "Unassigned"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 size-4 text-slate-400" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date / Time
              </dt>
              <dd>{formatSessionDateTime(session.startsAt, session.endsAt)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 text-slate-400" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </dt>
              <dd>{session.locationName ?? "Location TBD"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-4 text-slate-400" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Capacity
              </dt>
              <dd>
                {session.bookedCount}/{session.capacity} spots filled
              </dd>
              {waitlist > 0 ? (
                <p className="mt-1 text-sm font-medium text-orange-600">
                  Waitlist: {waitlist} members
                </p>
              ) : null}
            </div>
          </div>
        </dl>

        <Link
          href={`/schedule/${session.id}/roster`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          <Users className="size-4" />
          View Full Class Roster
        </Link>
      </div>

      <div className="space-y-2 border-t border-neutral-200 p-5">
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" disabled>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button type="button" variant="secondary" disabled className="text-rose-700">
            <Trash2 className="size-4" />
            Cancel
          </Button>
        </div>
        <Button type="button" disabled fullWidth>
          <Mail className="size-4" />
          Message Class Members
        </Button>
      </div>
    </aside>
  );
}
