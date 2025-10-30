import { test, expect } from "@playwright/test";

test.describe("Frontend application", () => {
  test("renders the main page", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Check if the page has the expected heading
    await expect(
      page.getByRole("heading", { name: /Vite \+ React \+ Tailwind/i }),
    ).toBeVisible();
  });

  test("increments counter when clicking the Increment button", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173");

    // Check initial state
    await expect(page.getByText(/0\s*times/i)).toBeVisible();

    // Click the increment button
    const button = page.getByRole("button", { name: /increment/i });
    await button.click();

    // Check updated state
    await expect(page.getByText(/1\s*times/i)).toBeVisible();
  });

  test("toggles dark mode", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Get the dark mode toggle button
    const toggleButton = page.getByRole("button", { name: /mode/i });

    // Check initial state (should be dark mode by default)
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(toggleButton).toContainText(/dark mode/i);

    // Toggle to light mode
    await toggleButton.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(toggleButton).toContainText(/light mode/i);

    // Toggle back to dark mode
    await toggleButton.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(toggleButton).toContainText(/dark mode/i);
  });
});
