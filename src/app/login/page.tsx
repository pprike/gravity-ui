"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(900px 520px at 15% 10%, rgba(20,184,166,0.18), transparent 55%), radial-gradient(700px 420px at 85% 90%, rgba(15,118,110,0.12), transparent 50%), linear-gradient(160deg, #f7fbfa 0%, #eef6f4 45%, #f4f8f7 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f766e' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-up space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow">
            <Dumbbell className="size-7" aria-hidden />
          </div>
          <p className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Gravity
          </p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-neutral-800">
            {tenantOptions ? "Choose organization" : "Sign in"}
          </h1>
          <p className="mt-2 text-body text-neutral-600">
            {tenantOptions
              ? "This email is linked to multiple organizations. Select one to continue."
              : "Access your role-specific staff dashboard"}
          </p>
        </div>

        <Card className="shadow-lift">
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
                className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700"
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
          <Card padding="sm" className="border-dashed bg-white/70">
            <p className="mb-1 text-sm font-semibold text-neutral-800">
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
            className="font-semibold text-primary-700 transition-colors hover:text-primary-800"
          >
            Activate your account
          </Link>
        </p>
      </div>
    </div>
  );
}
