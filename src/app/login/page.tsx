"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { demoLoginEnabled } from "@/lib/auth/demo";
import { getDashboardPath } from "@/lib/navigation/config";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { TenantLoginOption, UserRole } from "@/lib/types/auth";

const DEMO_ROLES: UserRole[] = [
  "ADMIN",
  "OWNER",
  "COACH",
  "RECEPTIONIST",
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantOptions, setTenantOptions] = useState<TenantLoginOption[] | null>(
    null,
  );
  const [selectedTenantSlug, setSelectedTenantSlug] = useState("");
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
    setIsSubmitting(true);

    try {
      const result = await login({
        email,
        password,
        tenantSlug: tenantOptions ? selectedTenantSlug : undefined,
      });

      if (result.kind === "tenantSelection") {
        if (result.tenants.length === 0) {
          setError("No organizations are available for this account.");
          return;
        }
        setTenantOptions(result.tenants);
        setSelectedTenantSlug(result.tenants[0]?.tenantSlug ?? "");
        return;
      }

      router.replace(getDashboardPath(result.session.user.roles));
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to sign in. Check your credentials and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToSignIn() {
    setTenantOptions(null);
    setSelectedTenantSlug("");
    setError("");
  }

  function handleDemoLogin(role: UserRole) {
    const path = loginAsDemo(role);
    router.replace(path);
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
          <h1 className="mt-2 text-display text-neutral-900">
            {tenantOptions ? "Choose organization" : "Sign in"}
          </h1>
          <p className="mt-2 text-body text-neutral-600">
            {tenantOptions
              ? "This email is linked to multiple organizations. Select one to continue."
              : "Access your role-specific staff dashboard"}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!tenantOptions ? (
              <>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </>
            ) : (
              <Select
                label="Organization"
                options={tenantOptions.map((tenant) => ({
                  value: tenant.tenantSlug,
                  label: tenant.tenantName,
                }))}
                value={selectedTenantSlug}
                onChange={(event) => setSelectedTenantSlug(event.target.value)}
                showRequired
              />
            )}

            {error && (
              <p
                className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              {tenantOptions ? "Continue" : "Sign in"}
            </Button>

            {tenantOptions ? (
              <Button
                type="button"
                variant="tertiary"
                fullWidth
                onClick={handleBackToSignIn}
              >
                Back to sign in
              </Button>
            ) : null}
          </form>
        </Card>

        {!tenantOptions && demoLoginEnabled() ? (
          <Card padding="sm">
            <p className="mb-3 text-sm font-medium text-neutral-800">
              Preview without API
            </p>
            <p className="mb-4 text-caption text-neutral-500">
              Explore role-based navigation with demo accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant="secondary"
                  onClick={() => handleDemoLogin(role)}
                >
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </Card>
        ) : null}

        <p className="text-center text-caption text-neutral-500">
          Invited to join?{" "}
          <Link
            href="/activate"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Activate your account
          </Link>
        </p>
      </div>
    </div>
  );
}
