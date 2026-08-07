"use client";

import { useEffect } from "react";
import { getBranding } from "@/lib/api/branding";
import { applyBrandingToDocument } from "@/lib/branding/apply";

export function BrandingLoader() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const branding = await getBranding();
        if (!cancelled) applyBrandingToDocument(branding);
      } catch {
        // Branding is optional on first load
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
