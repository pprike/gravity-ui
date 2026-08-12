"use client";

import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import { SidePanel } from "@/components/ui/SidePanel";
import {
  displayStatus,
  MemberStatusPill,
} from "@/components/members/MemberStatusPill";
import type { MemberSearchResult } from "@/lib/types/member";

interface MemberQuickProfileProps {
  member: MemberSearchResult | null;
  open: boolean;
  onClose: () => void;
}

export function MemberQuickProfile({ member, open, onClose }: MemberQuickProfileProps) {
  if (!member) return null;

  const name = member.displayName ?? member.email;
  const status = displayStatus(member);

  return (
    <SidePanel
      open={open}
      title={name}
      description="Member profile"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Close
          </button>
          <Link
            href={`/members/${member.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700"
          >
            View profile
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatarUrl}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-600">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-neutral-900">{name}</p>
            <MemberStatusPill status={status} />
          </div>
        </div>

        <dl className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-neutral-400" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Email
              </dt>
              <dd className="text-sm text-neutral-900">{member.email}</dd>
            </div>
          </div>

          {member.phone && (
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-neutral-400" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Phone
                </dt>
                <dd className="text-sm text-neutral-900">{member.phone}</dd>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <User className="mt-0.5 size-4 shrink-0 text-neutral-400" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Membership
              </dt>
              <dd className="text-sm text-neutral-900">
                {member.membershipPlanName ?? "No plan assigned"}
                {member.membershipStatus && (
                  <span className="ml-2 text-neutral-500">
                    ({member.membershipStatus})
                  </span>
                )}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </SidePanel>
  );
}
