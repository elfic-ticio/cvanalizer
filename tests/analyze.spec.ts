import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

// This test requires a valid authenticated session cookie.
// Set TEST_SESSION_COOKIE in your environment before running e2e tests.
// See README for instructions on extracting the session cookie.

test.describe("Analyze — happy path", () => {
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

  test("loads analyze page after auth", async ({ page }) => {
    await page.goto("/analyze");
    await expect(page.getByText("Analyze your CV")).toBeVisible();
  });

  test("PDF upload and full analysis flow", async ({ page }) => {
    // Create a minimal test PDF buffer if sample doesn't exist
    const samplePath = path.join(__dirname, "fixtures", "sample.pdf");
    if (!fs.existsSync(samplePath)) {
      test.skip();
      return;
    }

    await page.goto("/analyze");

    // Upload PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(samplePath);
    await expect(page.getByText("sample.pdf")).toBeVisible();

    // Fill form
    await page.getByPlaceholder("Senior Frontend Engineer").fill("Software Engineer");
    await page.getByPlaceholder("Acme Inc.").fill("TestCorp");
    await page
      .getByPlaceholder("Paste the full job description here...")
      .fill(
        "We are looking for a Software Engineer with experience in TypeScript, React, and Node.js. The ideal candidate has 3+ years of experience and understands REST APIs and databases."
      );

    // Submit
    await page.getByText("Analyze Compatibility").click();

    // Wait for result (Gemini call may take up to 30s)
    await expect(page.getByText("Analysis Complete")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText("Matching Skills")).toBeVisible();
    await expect(page.getByText("Missing Skills")).toBeVisible();
    await expect(page.getByText("Suggestions to Improve")).toBeVisible();
  });
});
