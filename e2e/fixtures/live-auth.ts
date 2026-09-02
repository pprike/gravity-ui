import { expect, type Page } from "@playwright/test";

export const LIVE_ADMIN_EMAIL =
  process.env.E2E_ADMIN_EMAIL ?? "admin@tenant-a.com";
export const LIVE_ADMIN_PASSWORD =
  process.env.E2E_ADMIN_PASSWORD ?? "Password123!";

export const liveE2eEnabled = process.env.E2E_LIVE === "true";

export async function loginAsLiveAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(LIVE_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(LIVE_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
