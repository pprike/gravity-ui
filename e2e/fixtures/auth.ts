import { expect, type Page } from "@playwright/test";

export async function loginAsDemoAdmin(page: Page) {
  await page.goto("/login");
  const adminButton = page.getByRole("button", { name: "Admin" });
  await adminButton.waitFor({ state: "visible" });
  await adminButton.click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export function sidebarLink(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name, exact: true });
}
