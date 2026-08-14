import { ClassRosterView } from "@/components/schedule/ClassRosterView";

interface ClassRosterRouteProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ClassRosterRoute({
  params,
}: ClassRosterRouteProps) {
  const { sessionId } = await params;
  return <ClassRosterView sessionId={sessionId} />;
}
