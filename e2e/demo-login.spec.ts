import { expect, test } from "@playwright/test";
import { loginAsDemoAdmin, sidebarLink } from "./fixtures/auth";

test.describe("Demo login", () => {
  test("admin can sign in without API and reach dashboard", async ({ page }) => {
    await page.goto("/login");
    const adminButton = page.getByRole("button", { name: "Admin" });
    await adminButton.waitFor({ state: "visible" });
    await adminButton.click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await expect(sidebarLink(page, "Members")).toBeVisible();
  });

  test("coach demo account shows schedule navigation", async ({ page }) => {
    await page.goto("/login");
    const coachButton = page.getByRole("button", { name: "Coach" });
    await coachButton.waitFor({ state: "visible" });
    await coachButton.click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(sidebarLink(page, "Schedule")).toBeVisible();
    await expect(sidebarLink(page, "Members")).not.toBeVisible();
  });
});
