import { apiRequest } from "@/lib/api/client";

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

export async function getAppConfiguration(): Promise<AppConfiguration> {
  return apiRequest<AppConfiguration>("/api/v1/app-configurations/current");
}

export async function updateAppConfiguration(
  payload: UpdateAppConfigurationPayload,
): Promise<AppConfiguration> {
  return apiRequest<AppConfiguration>("/api/v1/app-configurations/current", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getStoreMetadata(): Promise<StoreMetadata> {
  return apiRequest<StoreMetadata>("/api/v1/store-metadata");
}

export async function updateStoreMetadata(
  payload: UpdateStoreMetadataPayload,
): Promise<StoreMetadata> {
  return apiRequest<StoreMetadata>("/api/v1/store-metadata", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
