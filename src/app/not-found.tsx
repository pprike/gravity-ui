import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Dumbbell className="size-6" aria-hidden />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
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
