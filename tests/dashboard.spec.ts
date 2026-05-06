import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
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

  test("loads dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("+ New Analysis")).toBeVisible();
  });

  test("shows empty state or real metrics", async ({ page }) => {
    await page.goto("/");
    const hasEmpty = await page
      .getByText("No analyses yet")
      .isVisible()
      .catch(() => false);
    const hasMetrics = await page
      .getByText("Average Score")
      .isVisible()
      .catch(() => false);
    expect(hasEmpty || hasMetrics).toBeTruthy();
  });

  test("nav links are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Analyze" })).toBeVisible();
    await expect(page.getByRole("link", { name: "History" })).toBeVisible();
  });
});
