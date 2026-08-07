import { Suspense } from "react";
import { ActivateForm } from "./ActivateForm";

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      }
    >
      <ActivateForm />
    </Suspense>
  );
}
