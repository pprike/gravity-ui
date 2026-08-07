"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activateInvite, isAuthenticated, isLoading } = useAuth();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token.trim()) {
      setError("Activation token is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const path = await activateInvite({ token, password });
      router.replace(path);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to activate your account. The invitation may be expired.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Gravity
          </p>
          <h1 className="mt-2 text-display text-neutral-900">Activate account</h1>
          <p className="mt-2 text-body text-neutral-600">
            Set your password to join your organization
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Invitation token"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your invitation token"
              hint="Found in your invitation email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              hint="At least 8 characters"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />

            {error && (
              <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Activate account
            </Button>
          </form>
        </Card>

        <p className="text-center text-caption text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
