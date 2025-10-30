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
    await expect(toggleButton).toBeVisible();

    // Get initial state
    const htmlElement = page.locator("html");
    const initialButtonText = await toggleButton.textContent();
    const hasInitialDarkClass = await htmlElement.evaluate((el) =>
      el.classList.contains("dark"),
    );

    // Toggle to the opposite mode
    await toggleButton.click();

    // Verify the mode changed
    const hasClassAfterToggle = await htmlElement.evaluate((el) =>
      el.classList.contains("dark"),
    );
    expect(hasClassAfterToggle).toBe(!hasInitialDarkClass);

    // Verify button text changed
    const buttonTextAfterToggle = await toggleButton.textContent();
    expect(buttonTextAfterToggle).not.toBe(initialButtonText);

    // Toggle back to original mode
    await toggleButton.click();

    // Verify it returned to original state
    const hasClassAfterSecondToggle = await htmlElement.evaluate((el) =>
      el.classList.contains("dark"),
    );
    expect(hasClassAfterSecondToggle).toBe(hasInitialDarkClass);

    const buttonTextAfterSecondToggle = await toggleButton.textContent();
    expect(buttonTextAfterSecondToggle).toBe(initialButtonText);
  });
});
