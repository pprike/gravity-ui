import { MemberDetailPage } from "@/components/members/MemberDetailPage";

interface MemberDetailRouteProps {
  params: Promise<{ userId: string }>;
}

export default async function MemberDetailRoute({
  params,
}: MemberDetailRouteProps) {
  const { userId } = await params;
  return <MemberDetailPage userId={userId} />;
}
