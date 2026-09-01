"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { clearSession } from "@/lib/auth/storage";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal route error:", error);
  }, [error]);

  function handleSignOut() {
    clearSession();
    window.location.assign("/login");
  }

  return (
    <Card padding="lg" className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger-50">
        <AlertTriangle className="size-6 text-danger-600" />
      </div>
      <h1 className="text-lg font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">
        This page hit an unexpected error. You can try again or return to the
        dashboard.
      </p>
      {error.message ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {error.message}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="secondary" onClick={() => {
          window.location.assign("/dashboard");
        }}>
          Go to dashboard
        </Button>
        <Button type="button" variant="tertiary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </Card>
  );
}
