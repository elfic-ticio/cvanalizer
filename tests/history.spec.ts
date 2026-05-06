import { test, expect } from "@playwright/test";

test.describe("History page", () => {
  test.beforeEach(async ({ context }) => {
    const cookie = process.env.TEST_SESSION_COOKIE;
    if (!cookie) test.skip();
    await context.addCookies([
      {
        name: "authjs.session-token",
        value: cookie!,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
      },
    ]);
  });

  test("loads history page", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
  });

  test("shows empty state or analysis list", async ({ page }) => {
    await page.goto("/history");
    const hasEmpty = await page.getByText("No analyses yet").isVisible().catch(() => false);
    const hasList = await page.locator(".border.border-border").first().isVisible().catch(() => false);
    expect(hasEmpty || hasList).toBeTruthy();
  });

  test("filter by company input is present", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByPlaceholder("Filter by company...")).toBeVisible();
  });

  test("filter by company submits correctly", async ({ page }) => {
    await page.goto("/history");
    await page.getByPlaceholder("Filter by company...").fill("TestCorp");
    await page.getByRole("button", { name: "Filter" }).click();
    await expect(page).toHaveURL(/company=TestCorp/);
  });
});
