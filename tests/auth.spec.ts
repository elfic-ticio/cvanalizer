import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders sign-in options", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Continue with Google")).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
    await expect(page.getByText("Send magic link")).toBeVisible();
  });

  test("magic link form validates email", async ({ page }) => {
    await page.goto("/login");
    const submitBtn = page.getByText("Send magic link");
    await expect(submitBtn).toBeDisabled();
    await page.getByPlaceholder("your@email.com").fill("test@example.com");
    await expect(submitBtn).toBeEnabled();
  });
});
