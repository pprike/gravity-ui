import { expect, test } from "@playwright/test";
import { liveE2eEnabled, loginAsLiveAdmin } from "../fixtures/live-auth";
import { sidebarLink } from "../fixtures/auth";

test.describe("Live members", () => {
  test.skip(!liveE2eEnabled, "Set E2E_LIVE=true with gravity-service running.");

  test.beforeEach(async ({ page }) => {
    await loginAsLiveAdmin(page);
  });

  test("admin can load the members list from the API", async ({ page }) => {
    await sidebarLink(page, "Members").click();
    await expect(page).toHaveURL(/\/members/);
    await expect(
      page.getByRole("searchbox", { name: "Search members" }),
    ).toBeVisible();
    await expect(page.getByText("member@tenant-a.com")).toBeVisible();
  });
});
