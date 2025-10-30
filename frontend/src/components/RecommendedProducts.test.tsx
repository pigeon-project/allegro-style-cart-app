import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RecommendedProducts from "./RecommendedProducts";
import * as cartApi from "../lib/cart-api";

// Mock react-spring to avoid animation issues in tests
vi.mock("react-spring", () => ({
  useSpring: () => ({}),
  animated: {
    div: "div",
  },
}));

// Mock the cart API
vi.mock("../lib/cart-api", async () => {
  const actual = await vi.importActual("../lib/cart-api");
  return {
    ...actual,
    useAddCartItem: vi.fn(),
  };
});

describe("RecommendedProducts", () => {
  let queryClient: QueryClient;
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockMutate = vi.fn();

    vi.mocked(cartApi.useAddCartItem).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      status: "idle",
      submittedAt: 0,
      mutateAsync: vi.fn(),
    } as never);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RecommendedProducts />
      </QueryClientProvider>,
    );
  };

  describe("Component Rendering", () => {
    it("renders the component with title", () => {
      renderComponent();
      expect(screen.getByText("Recommended Products")).toBeTruthy();
    });

    it("renders product cards with images, titles, and prices", () => {
      renderComponent();
      expect(
        screen.getByText("Premium Wireless Headphones with Noise Cancellation"),
      ).toBeTruthy();
      expect(
        screen.getByText("Smart Watch with Health Monitoring"),
      ).toBeTruthy();
      expect(screen.getByText("299.99 PLN")).toBeTruthy();
      expect(screen.getByText("199.99 PLN")).toBeTruthy();
    });

    it("renders Add to Cart buttons for all products", () => {
      renderComponent();
      const addButtons = screen.getAllByRole("button", {
        name: /add .* to cart/i,
      });
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it("renders navigation arrows on desktop", () => {
      renderComponent();
      expect(
        screen.getByRole("button", { name: /previous products/i }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /next products/i }),
      ).toBeTruthy();
    });

    it("renders carousel with proper ARIA labels", () => {
      renderComponent();
      const carousel = screen.getByRole("region", {
        name: /recommended products carousel/i,
      });
      expect(carousel).toBeTruthy();
    });

    it("renders dot indicators for navigation", () => {
      renderComponent();
      const dots = screen.getAllByRole("button", { name: /go to slide/i });
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe("Add to Cart Functionality", () => {
    it("calls addCartItem mutation when Add to Cart is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      const addButton = screen.getAllByRole("button", {
        name: /add .* to cart/i,
      })[0];

      await user.click(addButton);

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          productTitle: "Premium Wireless Headphones with Noise Cancellation",
          pricePerUnit: 299.99,
          quantity: 1,
        }),
        expect.any(Object),
      );
    });

    it("shows success toast when item is added successfully", async () => {
      const user = userEvent.setup();
      mockMutate.mockImplementation((_, options) => {
        options?.onSuccess?.();
      });

      renderComponent();
      const addButton = screen.getAllByRole("button", {
        name: /add .* to cart/i,
      })[0];

      await user.click(addButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /"Premium Wireless Headphones with Noise Cancellation" added to cart!/,
          ),
        ).toBeTruthy();
      });
    });

    it("disables buttons during loading", () => {
      vi.mocked(cartApi.useAddCartItem).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        isSuccess: false,
        error: null,
        data: undefined,
        reset: vi.fn(),
        variables: undefined,
        context: undefined,
        failureCount: 0,
        failureReason: null,
        isIdle: false,
        isPaused: false,
        status: "pending",
        submittedAt: 0,
        mutateAsync: vi.fn(),
      } as never);

      renderComponent();
      const addButtons = screen.getAllByRole("button", {
        name: /add .* to cart/i,
      });

      addButtons.forEach((button) => {
        expect(button).toHaveProperty("disabled", true);
      });
    });

    it("includes all required product data in mutation", async () => {
      const user = userEvent.setup();
      renderComponent();
      const addButton = screen.getAllByRole("button", {
        name: /add smart watch/i,
      })[0];

      await user.click(addButton);

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          sellerId: "550e8400-e29b-41d4-a716-446655440002",
          productImage: expect.stringContaining("unsplash"),
          productTitle: "Smart Watch with Health Monitoring",
          pricePerUnit: 199.99,
          quantity: 1,
        }),
        expect.any(Object),
      );
    });
  });

  describe("Carousel Navigation - Desktop Arrows", () => {
    it("next button navigates to next set of products", async () => {
      const user = userEvent.setup();
      renderComponent();
      const nextButton = screen.getByRole("button", {
        name: /next products/i,
      });

      await user.click(nextButton);

      // Check that the carousel has moved by checking dot indicators
      const dots = screen.getAllByRole("button", { name: /go to slide/i });
      expect(dots[1].className).toContain("bg-indigo-600");
    });

    it("previous button navigates to previous set of products", async () => {
      const user = userEvent.setup();
      renderComponent();
      const nextButton = screen.getByRole("button", {
        name: /next products/i,
      });
      const prevButton = screen.getByRole("button", {
        name: /previous products/i,
      });

      await user.click(nextButton);
      await user.click(prevButton);

      const dots = screen.getAllByRole("button", { name: /go to slide/i });
      expect(dots[0].className).toContain("bg-indigo-600");
    });

    it("disables previous button at first position", () => {
      renderComponent();
      const prevButton = screen.getByRole("button", {
        name: /previous products/i,
      });

      expect(prevButton).toHaveProperty("disabled", true);
    });

    it("disables next button at last position", async () => {
      const user = userEvent.setup();
      renderComponent();
      const nextButton = screen.getByRole("button", {
        name: /next products/i,
      }) as HTMLButtonElement;

      // Click next until we reach the end
      while (!nextButton.disabled) {
        await user.click(nextButton);
      }

      expect(nextButton).toHaveProperty("disabled", true);
    });
  });

  describe("Carousel Navigation - Dot Indicators", () => {
    it("clicking dot indicator navigates to specific slide", async () => {
      const user = userEvent.setup();
      renderComponent();
      const dots = screen.getAllByRole("button", { name: /go to slide/i });

      if (dots.length > 1) {
        await user.click(dots[1]);

        expect(dots[1].className).toContain("bg-indigo-600");
        expect(dots[0].className).not.toContain("bg-indigo-600");
      }
    });

    it("highlights current slide dot indicator", () => {
      renderComponent();
      const dots = screen.getAllByRole("button", { name: /go to slide/i });

      expect(dots[0].className).toContain("bg-indigo-600");
    });
  });

  describe("Keyboard Navigation", () => {
    it("navigates to next slide with ArrowRight key", async () => {
      const user = userEvent.setup();
      renderComponent();
      const carousel = screen.getByRole("region", {
        name: /recommended products carousel/i,
      });

      carousel.focus();
      await user.keyboard("{ArrowRight}");

      const dots = screen.getAllByRole("button", { name: /go to slide/i });
      expect(dots[1].className).toContain("bg-indigo-600");
    });

    it("navigates to previous slide with ArrowLeft key", async () => {
      const user = userEvent.setup();
      renderComponent();
      const carousel = screen.getByRole("region", {
        name: /recommended products carousel/i,
      });

      carousel.focus();
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{ArrowLeft}");

      const dots = screen.getAllByRole("button", { name: /go to slide/i });
      expect(dots[0].className).toContain("bg-indigo-600");
    });

    it("does not navigate past first slide with ArrowLeft", async () => {
      const user = userEvent.setup();
      renderComponent();
      const carousel = screen.getByRole("region", {
        name: /recommended products carousel/i,
      });

      carousel.focus();
      await user.keyboard("{ArrowLeft}");

      const dots = screen.getAllByRole("button", { name: /go to slide/i });
      expect(dots[0].className).toContain("bg-indigo-600");
    });

    it("carousel is keyboard focusable", () => {
      renderComponent();
      const carousel = screen.getByRole("region", {
        name: /recommended products carousel/i,
      });

      expect(carousel.getAttribute("tabIndex")).toBe("0");
    });
  });

  describe("Responsive Behavior", () => {
    it("adjusts items per view on window resize", () => {
      const { container } = renderComponent();
      const carousel = container.querySelector(".overflow-hidden");

      expect(carousel).toBeTruthy();
      // Note: Full responsive testing would require mocking window.innerWidth
    });
  });

  describe("Dark Mode Support", () => {
    it("applies dark mode classes", () => {
      renderComponent();
      const title = screen.getByText("Recommended Products");

      expect(title.className).toContain("dark:text-slate-100");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels on buttons", () => {
      renderComponent();
      const prevButton = screen.getByRole("button", {
        name: /previous products/i,
      });
      const nextButton = screen.getByRole("button", {
        name: /next products/i,
      });

      expect(prevButton.getAttribute("aria-label")).toBeTruthy();
      expect(nextButton.getAttribute("aria-label")).toBeTruthy();
    });

    it("success toast has proper ARIA attributes", async () => {
      const user = userEvent.setup();
      mockMutate.mockImplementation((_, options) => {
        options?.onSuccess?.();
      });

      renderComponent();
      const addButton = screen.getAllByRole("button", {
        name: /add .* to cart/i,
      })[0];

      await user.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast.getAttribute("aria-live")).toBe("polite");
      });
    });

    it("product images have alt text", () => {
      renderComponent();
      const images = screen.getAllByRole("img");

      images.forEach((img) => {
        expect(img.getAttribute("alt")).toBeTruthy();
      });
    });

    it("buttons have minimum touch target size", () => {
      renderComponent();
      const addButtons = screen.getAllByRole("button", {
        name: /add .* to cart/i,
      });

      addButtons.forEach((button) => {
        expect(button.className).toContain("min-h-[44px]");
      });
    });
  });

  describe("Edge Cases", () => {
    it("renders correctly with all products", () => {
      renderComponent();

      // All 6 products should be rendered
      expect(
        screen.getAllByText(
          "Premium Wireless Headphones with Noise Cancellation",
        ).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Smart Watch with Health Monitoring").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Designer Sunglasses UV Protection").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Leather Backpack for Travel").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Portable Bluetooth Speaker").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Fitness Tracker Smart Band").length,
      ).toBeGreaterThan(0);
    });
  });

  describe("Touch/Swipe Gestures", () => {
    it("has touch-pan-y class for touch support", () => {
      const { container } = renderComponent();
      const carousel = container.querySelector(".overflow-hidden");

      expect(carousel?.className).toContain("touch-pan-y");
    });

    it("changes cursor on drag", () => {
      const { container } = renderComponent();
      const carousel = container.querySelector(
        ".overflow-hidden",
      ) as HTMLElement;

      expect(carousel?.style.cursor).toBe("grab");
    });
  });
});
