import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-panel border border-neutral-200/80 bg-surface p-8 text-center shadow-card animate-fade-up">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow">
          <Dumbbell className="size-6" aria-hidden />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          That URL is not part of the Gravity admin portal.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard">
            <Button type="button">Go to dashboard</Button>
          </Link>
          <Link href="/login">
            <Button type="button" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
