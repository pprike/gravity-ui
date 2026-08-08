"use client";

import { use } from "react";
import { ProfileEditForm } from "@/components/members/ProfileEditForm";
import { useAuth } from "@/lib/auth/context";
import { demoMembershipsEnabled } from "@/lib/memberships/demo";

interface EditMemberProfilePageProps {
  params: Promise<{ userId: string }>;
}

const DEMO_MEMBER = {
  id: "demo-member-1",
  firstName: "Jessica",
  lastName: "Chen",
  email: "j.chen@email.com",
};

export default function EditMemberProfilePage({
  params,
}: EditMemberProfilePageProps) {
  const { userId } = use(params);
  const { session } = useAuth();

  const demoMember =
    demoMembershipsEnabled() && userId === DEMO_MEMBER.id
      ? DEMO_MEMBER
      : null;

  const user = demoMember ?? session?.user;
  if (!user) {
    return (
      <p className="text-sm text-slate-500">
        Sign in to edit profile information.
      </p>
    );
  }

  return (
    <ProfileEditForm
      userId={userId}
      email={user.email}
      firstName={"firstName" in user ? user.firstName : demoMember?.firstName}
      lastName={"lastName" in user ? user.lastName : demoMember?.lastName}
    />
  );
}
