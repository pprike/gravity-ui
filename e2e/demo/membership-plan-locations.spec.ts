import { expect, test } from "@playwright/test";
import { loginAsDemoAdmin } from "../fixtures/auth";

test.describe("Membership plan location access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoAdmin(page);
    await page.goto("/memberships");
  });

  test("lists location access per plan", async ({ page }) => {
    await expect(page.getByText("Locations", { exact: true })).toBeVisible();
    await expect(page.getByText("All locations").first()).toBeVisible();
    await expect(page.getByText("Westside Gym")).toBeVisible();
    await expect(page.getByText("Downtown Club, North Campus")).toBeVisible();
  });

  test("create and edit forms include location multi-select", async ({ page }) => {
    await page.getByRole("button", { name: "Create Plan" }).click();
    await expect(page).toHaveURL(/\/memberships\/new/);

    await page.getByLabel("Plan Name").fill("Test Location Plan");
    await page.getByRole("button", { name: "Next Step" }).click();
    await page.getByLabel("Price").fill("10");
    await page.getByRole("button", { name: "Next Step" }).click();

    await expect(page.getByText("Location Access")).toBeVisible();
    await expect(
      page.getByText("All locations", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "+ Downtown Club" }).click();
    await expect(
      page.getByRole("button", { name: "Remove Downtown Club" }),
    ).toBeVisible();

    await page.goto("/memberships/plan-2/edit");
    await page.getByRole("button", { name: "Next Step" }).click();
    await page.getByRole("button", { name: "Next Step" }).click();
    await expect(
      page.getByRole("button", { name: "Remove Westside Gym" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Remove Westside Gym" }).click();
    await expect(
      page.getByText("All locations", { exact: true }),
    ).toBeVisible();
  });
});
