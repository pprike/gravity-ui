"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MemberDetailView } from "@/components/members/MemberDetailView";
import { fetchMemberSummary } from "@/lib/api/member-detail";

interface MemberDetailPageProps {
  userId: string;
}

export function MemberDetailPage({ userId }: MemberDetailPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState("Member");
  const [member, setMember] = useState<
    Awaited<ReturnType<typeof fetchMemberSummary>>["member"] | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const summary = await fetchMemberSummary(userId);
        if (cancelled) return;
        setMember(summary.member);
        setMemberSince(summary.memberSince);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load member";
        if (message.toLowerCase().includes("not found")) {
          setError("Member not found.");
        } else {
          setError(message);
        }
        setMember(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        Loading member…
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-danger-600">{error ?? "Member not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/members")}
          className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          Back to members
        </button>
      </div>
    );
  }

  return (
    <MemberDetailView
      member={member}
      memberSince={memberSince}
      userId={userId}
    />
  );
}
