import { expect, test } from "@playwright/test";
import { sidebarLink } from "../fixtures/auth";
import { liveE2eEnabled, loginAsLiveAdmin } from "../fixtures/live-auth";

test.describe("Live admin navigation", () => {
  test.skip(!liveE2eEnabled, "Set E2E_LIVE=true with gravity-service running.");

  test.beforeEach(async ({ page }) => {
    await loginAsLiveAdmin(page);
  });

  test("admin can open core portal pages against the API", async ({ page }) => {
    await sidebarLink(page, "Memberships").click();
    await expect(page).toHaveURL(/\/memberships/);
    await expect(
      page.getByRole("heading", { name: "Memberships" }),
    ).toBeVisible();

    await sidebarLink(page, "Communication").click();
    await expect(page).toHaveURL(/\/communication/);

    await sidebarLink(page, "Attendance").click();
    await expect(page).toHaveURL(/\/attendance/);

    await sidebarLink(page, "Settings").click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
