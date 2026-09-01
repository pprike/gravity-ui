import { clearSession } from "@/lib/auth/storage";

export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  clearSession();
  window.location.assign("/login");
}
