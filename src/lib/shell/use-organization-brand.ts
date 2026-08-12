"use client";

import { useEffect, useState } from "react";
import { getOrganization } from "@/lib/api/organization";
import { isDemoSession } from "@/lib/settings/demo";

interface OrganizationBrand {
  name: string;
  shortName: string;
}

const DEFAULT_BRAND: OrganizationBrand = {
  name: "Gravity",
  shortName: "GRAVITY",
};

function toShortName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return DEFAULT_BRAND.shortName;
  if (words.length === 1) return words[0]!.slice(0, 10).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function useOrganizationBrand(): OrganizationBrand {
  const [brand, setBrand] = useState<OrganizationBrand>(DEFAULT_BRAND);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const org = await getOrganization();
        if (cancelled) return;
        setBrand({
          name: org.name,
          shortName: isDemoSession() ? "IRON PEAK" : toShortName(org.name),
        });
      } catch {
        if (!cancelled) setBrand(DEFAULT_BRAND);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return brand;
}
