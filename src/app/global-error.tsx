"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans text-slate-900">
        <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold">Application error</h1>
          <p className="mt-2 text-sm text-slate-600">
            Gravity could not load this page. Please try again or return to the
            sign-in screen.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Try again
            </button>
            <a
              href="/login"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-neutral-50"
            >
              Sign in
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
