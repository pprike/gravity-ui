import type { Branding } from "@/lib/types/settings";

const DEFAULT_PRIMARY = "#0d9488";

function shadeHex(hex: string, percent: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const num = parseInt(normalized, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function applyBrandingToDocument(branding: Partial<Branding>): void {
  if (typeof document === "undefined") return;

  const primary = branding.primaryColor ?? DEFAULT_PRIMARY;
  const root = document.documentElement;

  root.style.setProperty("--color-primary-50", shadeHex(primary, 80));
  root.style.setProperty("--color-primary-100", shadeHex(primary, 60));
  root.style.setProperty("--color-primary-500", shadeHex(primary, 20));
  root.style.setProperty("--color-primary-600", primary);
  root.style.setProperty("--color-primary-700", shadeHex(primary, -25));

  if (branding.fontFamily) {
    root.style.setProperty("--font-brand", branding.fontFamily);
    document.body.style.fontFamily = branding.fontFamily;
  }
}
