import { expect, test } from "@playwright/test";
import { liveE2eEnabled, loginAsLiveAdmin } from "../fixtures/live-auth";

test.describe("Live admin auth", () => {
  test.skip(!liveE2eEnabled, "Set E2E_LIVE=true with gravity-service running.");

  test("admin can sign in against the API", async ({ page }) => {
    await loginAsLiveAdmin(page);
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
  });
});
