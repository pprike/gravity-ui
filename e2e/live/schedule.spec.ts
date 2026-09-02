import { expect, test } from "@playwright/test";
import { liveE2eEnabled, loginAsLiveAdmin } from "../fixtures/live-auth";
import { sidebarLink } from "../fixtures/auth";

test.describe("Live schedule", () => {
  test.skip(!liveE2eEnabled, "Set E2E_LIVE=true with gravity-service running.");

  test.beforeEach(async ({ page }) => {
    await loginAsLiveAdmin(page);
  });

  test("admin can open the schedule calendar", async ({ page }) => {
    await sidebarLink(page, "Schedule").click();
    await expect(page).toHaveURL(/\/schedule/);
    await expect(
      page.getByRole("button", { name: "Create Class" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible();
  });
});
