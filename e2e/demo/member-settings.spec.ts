import { expect, test } from "@playwright/test";
import { loginAsDemoAdmin, sidebarLink } from "../fixtures/auth";

test.describe("Demo member and settings flows", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoAdmin(page);
  });

  test("admin can open a member profile and check in", async ({ page }) => {
    await sidebarLink(page, "Members").click();
    await page.getByRole("link", { name: "Alex Rivera" }).first().click();
    await expect(page).toHaveURL(/\/members\/demo-member-1$/);
    await expect(page.getByRole("heading", { name: "Alex Rivera" })).toBeVisible();

    await page.getByRole("button", { name: "Check In" }).click();
    await expect(page.getByRole("status")).toContainText("checked in");
  });

  test("settings audit log and store listing load in demo", async ({ page }) => {
    await sidebarLink(page, "Settings").click();
    await page.getByRole("link", { name: "Audit Log" }).click();
    await expect(
      page.getByRole("heading", { name: "Audit Log", exact: true, level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("user · invite")).toBeVisible();

    await page.getByRole("link", { name: "App Store" }).click();
    await expect(
      page.getByRole("heading", { name: "App Store Listing", level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel("App name")).toBeVisible();
  });
});
