import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";

// Test component that uses theme
function ThemeConsumer() {
  const { mode, toggleMode } = useTheme();
  return (
    <div>
      <div data-testid="theme-mode">{mode}</div>
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up DOM and localStorage
    cleanup();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("provides default light theme", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-mode").textContent).toBe("light");
  });

  it("toggles theme mode", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Initial state
    expect(screen.getByTestId("theme-mode").textContent).toBe("light");

    // Toggle to dark
    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);
    expect(screen.getByTestId("theme-mode").textContent).toBe("dark");

    // Toggle back to light
    await user.click(button);
    expect(screen.getByTestId("theme-mode").textContent).toBe("light");
  });

  it("persists theme mode in localStorage", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    expect(localStorage.getItem("theme-mode")).toBe("dark");
  });

  it("loads theme mode from localStorage", () => {
    localStorage.setItem("theme-mode", "dark");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-mode").textContent).toBe("dark");
  });

  it("applies dark class to document element", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Initial state - no dark class
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Toggle to dark
    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    // Dark class should be applied
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Toggle back to light
    await user.click(button);

    // Dark class should be removed
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("accepts defaultMode prop", () => {
    render(
      <ThemeProvider defaultMode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-mode").textContent).toBe("dark");
  });

  it("throws error when useTheme is used outside provider", () => {
    // Suppress console errors for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<ThemeConsumer />);
    }).toThrow("useTheme must be used within a ThemeProvider");

    console.error = originalError;
  });
});
