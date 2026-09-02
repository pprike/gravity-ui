import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PortalNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
        404
      </p>
      <h1 className="mt-2 text-xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        This page does not exist in the staff portal.
      </p>
      <Link href="/dashboard" className="mt-6 inline-flex">
        <Button type="button">Back to dashboard</Button>
      </Link>
    </div>
  );
}
