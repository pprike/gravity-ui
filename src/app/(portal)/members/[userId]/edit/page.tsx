"use client";

import { use } from "react";
import { ProfileEditForm } from "@/components/members/ProfileEditForm";

interface EditMemberProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function EditMemberProfilePage({
  params,
}: EditMemberProfilePageProps) {
  const { userId } = use(params);
  return <ProfileEditForm userId={userId} />;
}
