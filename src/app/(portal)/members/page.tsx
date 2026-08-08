"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/context";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";

const DEMO_MEMBERS = [
  {
    id: "demo-member-1",
    firstName: "Jessica",
    lastName: "Chen",
    email: "j.chen@email.com",
  },
];

export default function MembersPage() {
  const router = useRouter();
  const { session } = useAuth();
  const isDemo = demoMembershipsEnabled();

  if (!isDemo) {
    return (
      <EmptyState
        icon={Users}
        title="No members yet"
        description="When members join your organization, you'll search profiles, view attendance history, and manage accounts from here."
        actionLabel="Add member"
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Members</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search profiles and manage member accounts.
        </p>
      </div>

      <Card padding="sm" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_MEMBERS.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{member.email}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => router.push(`/members/${member.id}/edit`)}
                    >
                      Edit Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {session?.user && (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Your profile</p>
            <p className="text-sm text-slate-500">
              Edit your own account details and avatar.
            </p>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={() =>
              session?.user &&
              router.push(`/members/${session.user.id}/edit`)
            }
          >
            Edit My Profile
          </Button>
        </Card>
      )}
    </div>
  );
}
