import { expect, test } from "@playwright/test";
import { loginAsDemoAdmin, sidebarLink } from "./fixtures/auth";

test.describe("Admin portal navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoAdmin(page);
  });

  test("admin can open core portal pages", async ({ page }) => {
    await sidebarLink(page, "Members").click();
    await expect(page).toHaveURL(/\/members/);
    await expect(
      page.getByRole("searchbox", { name: "Search members" }),
    ).toBeVisible();

    await sidebarLink(page, "Memberships").click();
    await expect(page).toHaveURL(/\/memberships/);
    await expect(
      page.getByRole("heading", { name: "Membership Plans" }),
    ).toBeVisible();

    await sidebarLink(page, "Communication").click();
    await expect(page).toHaveURL(/\/communication/);
    await expect(
      page.getByRole("heading", { name: "Communication" }),
    ).toBeVisible();

    await sidebarLink(page, "Attendance").click();
    await expect(page).toHaveURL(/\/attendance/);

    await sidebarLink(page, "Settings").click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
