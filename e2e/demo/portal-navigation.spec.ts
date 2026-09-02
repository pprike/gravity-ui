import { expect, test } from "@playwright/test";
import { loginAsDemoAdmin, sidebarLink } from "../fixtures/auth";

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
      page.getByRole("heading", { name: "Memberships" }),
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

  test("dashboard loads live metrics and header search reaches members", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
    await expect(page.getByText("Active Members")).toBeVisible();
    await expect(page.getByText("Check-ins Today")).toBeVisible();

    await page.getByRole("searchbox", { name: "Search portal" }).fill("jessica");
    await page.getByRole("searchbox", { name: "Search portal" }).press("Enter");
    await expect(page).toHaveURL(/\/members\?q=jessica/);
    await expect(
      page.getByRole("searchbox", { name: "Search members" }),
    ).toHaveValue("jessica");
  });

  test("unknown portal route shows not found", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});
