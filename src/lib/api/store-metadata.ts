import { apiRequest } from "@/lib/api/client";
import { isDemoSession } from "@/lib/settings/demo";

export type StorePlatform = "ios" | "android" | "both";
export type StoreValidationSeverity = "error" | "warning";

export interface StoreValidationIssue {
  field: string;
  platform: StorePlatform;
  severity: StoreValidationSeverity;
  message: string;
}

export interface AppConfiguration {
  appName: string | null;
  iosBundleId: string | null;
  androidPackageName: string | null;
  deepLinkScheme: string | null;
  supportEmail: string | null;
  privacyPolicyUrl: string | null;
  termsUrl: string | null;
  validationIssues: StoreValidationIssue[];
}

export interface StoreMetadata {
  appStoreTitle: string | null;
  subtitle: string | null;
  shortDescription: string | null;
  description: string | null;
  keywords: string | null;
  promotionalText: string | null;
  screenshotUrls: string[];
  featureGraphicUrl: string | null;
  iconUrl: string | null;
  validationIssues: StoreValidationIssue[];
}

export type UpdateAppConfigurationPayload = {
  appName?: string;
  iosBundleId?: string;
  androidPackageName?: string;
  deepLinkScheme?: string;
  supportEmail?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
};

export type UpdateStoreMetadataPayload = {
  appStoreTitle?: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  keywords?: string;
  promotionalText?: string;
  screenshotUrls?: string[];
  featureGraphicUrl?: string;
  iconUrl?: string;
};

const DEMO_APP_CONFIG_KEY = "gravity-demo-app-configuration";
const DEMO_STORE_METADATA_KEY = "gravity-demo-store-metadata";

const DEFAULT_APP_CONFIG: AppConfiguration = {
  appName: "Iron Peak",
  iosBundleId: "com.ironpeak.member",
  androidPackageName: "com.ironpeak.member",
  deepLinkScheme: "ironpeak",
  supportEmail: "hello@gravityfitness.com",
  privacyPolicyUrl: "https://example.com/privacy",
  termsUrl: "https://example.com/terms",
  validationIssues: [],
};

const DEFAULT_STORE_METADATA: StoreMetadata = {
  appStoreTitle: "Iron Peak Fitness",
  subtitle: "Book classes. Stay consistent.",
  shortDescription: "The member app for Iron Peak studios.",
  description: "Book classes, manage memberships, and check in from your phone.",
  keywords: "fitness,gym,classes",
  promotionalText: null,
  screenshotUrls: [],
  featureGraphicUrl: null,
  iconUrl: null,
  validationIssues: [],
};

function readDemoValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeDemoValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function getAppConfiguration(): Promise<AppConfiguration> {
  if (isDemoSession()) {
    return readDemoValue(DEMO_APP_CONFIG_KEY, DEFAULT_APP_CONFIG);
  }
  return apiRequest<AppConfiguration>("/api/v1/app-configurations/current");
}

export async function updateAppConfiguration(
  payload: UpdateAppConfigurationPayload,
): Promise<AppConfiguration> {
  if (isDemoSession()) {
    const current = readDemoValue(DEMO_APP_CONFIG_KEY, DEFAULT_APP_CONFIG);
    const next = { ...current, ...payload, validationIssues: [] };
    writeDemoValue(DEMO_APP_CONFIG_KEY, next);
    return next;
  }
  return apiRequest<AppConfiguration>("/api/v1/app-configurations/current", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getStoreMetadata(): Promise<StoreMetadata> {
  if (isDemoSession()) {
    return readDemoValue(DEMO_STORE_METADATA_KEY, DEFAULT_STORE_METADATA);
  }
  return apiRequest<StoreMetadata>("/api/v1/store-metadata");
}

export async function updateStoreMetadata(
  payload: UpdateStoreMetadataPayload,
): Promise<StoreMetadata> {
  if (isDemoSession()) {
    const current = readDemoValue(DEMO_STORE_METADATA_KEY, DEFAULT_STORE_METADATA);
    const next = { ...current, ...payload, validationIssues: [] };
    writeDemoValue(DEMO_STORE_METADATA_KEY, next);
    return next;
  }
  return apiRequest<StoreMetadata>("/api/v1/store-metadata", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
