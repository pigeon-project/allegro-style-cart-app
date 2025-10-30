import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useDarkMode } from "./useDarkMode";

describe("useDarkMode Hook", () => {
  let originalMatchMedia: typeof window.matchMedia;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    Storage.prototype.getItem = vi.fn((key) => localStorageMock[key] || null);
    Storage.prototype.setItem = vi.fn((key, value) => {
      localStorageMock[key] = value;
    });
    Storage.prototype.removeItem = vi.fn((key) => {
      delete localStorageMock[key];
    });

    // Store original matchMedia
    originalMatchMedia = window.matchMedia;

    // Clear any existing theme classes
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with dark mode from localStorage when theme is 'dark'", () => {
      localStorageMock["theme"] = "dark";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should initialize with light mode from localStorage when theme is 'light'", () => {
      localStorageMock["theme"] = "light";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should use system preference when no localStorage value exists", () => {
      // Mock matchMedia to return dark preference
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should use light mode system preference when system prefers light", () => {
      // Mock matchMedia to return light preference
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query !== "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should default to dark mode when matchMedia is not supported", () => {
      // Remove matchMedia
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - intentionally setting to undefined for test
      delete window.matchMedia;

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      // Restore matchMedia
      window.matchMedia = originalMatchMedia;
    });
  });

  describe("Theme Toggling", () => {
    it("should toggle from light to dark mode", () => {
      localStorageMock["theme"] = "light";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should toggle from dark to light mode", () => {
      localStorageMock["theme"] = "dark";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should toggle multiple times correctly", () => {
      localStorageMock["theme"] = "light";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(false);

      // Toggle to dark
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isDark).toBe(true);

      // Toggle back to light
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isDark).toBe(false);

      // Toggle to dark again
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isDark).toBe(true);
    });
  });

  describe("LocalStorage Persistence", () => {
    it("should persist dark mode to localStorage", async () => {
      localStorageMock["theme"] = "light";

      const { result } = renderHook(() => useDarkMode());

      act(() => {
        result.current.toggle();
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
      });

      expect(localStorageMock["theme"]).toBe("dark");
    });

    it("should persist light mode to localStorage", async () => {
      localStorageMock["theme"] = "dark";

      const { result } = renderHook(() => useDarkMode());

      act(() => {
        result.current.toggle();
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith("theme", "light");
      });

      expect(localStorageMock["theme"]).toBe("light");
    });

    it("should save to localStorage on initialization when using system preference", async () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
      });
    });
  });

  describe("DOM Updates", () => {
    it("should add 'dark' class to document element when dark mode is enabled", () => {
      localStorageMock["theme"] = "light";

      const { result } = renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should remove 'dark' class from document element when light mode is enabled", () => {
      localStorageMock["theme"] = "dark";

      const { result } = renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should maintain 'dark' class state across re-renders", () => {
      localStorageMock["theme"] = "dark";

      const { result, rerender } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      rerender();

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid toggles correctly", () => {
      localStorageMock["theme"] = "light";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.isDark).toBe(false);

      // Rapid toggles
      act(() => {
        result.current.toggle();
        result.current.toggle();
        result.current.toggle();
      });

      expect(result.current.isDark).toBe(true);
    });

    it("should handle corrupted localStorage value gracefully", () => {
      localStorageMock["theme"] = "invalid-value";

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useDarkMode());

      // Should treat invalid value as light mode (not "dark")
      expect(result.current.isDark).toBe(false);
    });

    it("should provide a stable toggle function reference", () => {
      const { result, rerender } = renderHook(() => useDarkMode());

      const firstToggle = result.current.toggle;

      rerender();

      const secondToggle = result.current.toggle;

      expect(firstToggle).toBe(secondToggle);
    });
  });
});
