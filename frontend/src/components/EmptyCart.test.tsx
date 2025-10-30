import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmptyCart from "./EmptyCart";

describe("EmptyCart", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Basic Rendering", () => {
    it("renders the component", () => {
      render(<EmptyCart />);
      const heading = screen.getByRole("heading", {
        name: /your cart is empty/i,
      });
      expect(heading).toBeTruthy();
    });

    it("displays the empty cart illustration", () => {
      render(<EmptyCart />);
      const image = screen.getByAltText("Empty shopping cart");
      expect(image).toBeTruthy();
      expect((image as HTMLImageElement).src).toContain(
        "/empty-cart-image.svg",
      );
    });

    it("displays the empty state heading", () => {
      render(<EmptyCart />);
      const heading = screen.getByRole("heading", {
        name: /your cart is empty/i,
      });
      expect(heading).toBeTruthy();
      expect(heading.className).toContain("text-2xl");
      expect(heading.className).toContain("font-bold");
    });

    it("displays the empty state message", () => {
      render(<EmptyCart />);
      const message = screen.getByText(
        /start adding items to your cart and they will appear here/i,
      );
      expect(message).toBeTruthy();
    });
  });

  describe("Call-to-Action Button", () => {
    it("renders the Start Shopping button when onStartShopping prop is provided", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button).toBeTruthy();
    });

    it("does not render the Start Shopping button when onStartShopping prop is not provided", () => {
      render(<EmptyCart />);

      const button = screen.queryByRole("button", { name: /start shopping/i });
      expect(button).toBeFalsy();
    });

    it("calls onStartShopping when the button is clicked", async () => {
      const user = userEvent.setup();
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      await user.click(button);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("button has proper Allegro orange styling", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button.className).toContain("bg-orange-500");
      expect(button.className).toContain("hover:bg-orange-600");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("font-semibold");
      expect(button.className).toContain("rounded-lg");
    });
  });

  describe("Responsive Layout", () => {
    it("applies responsive padding classes", () => {
      const { container } = render(<EmptyCart />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.className).toContain("py-12");
      expect(wrapper.className).toContain("sm:py-16");
      expect(wrapper.className).toContain("px-4");
    });

    it("applies responsive text size classes to heading", () => {
      render(<EmptyCart />);
      const heading = screen.getByRole("heading", {
        name: /your cart is empty/i,
      });

      expect(heading.className).toContain("text-2xl");
      expect(heading.className).toContain("sm:text-3xl");
    });

    it("applies responsive text size classes to message", () => {
      render(<EmptyCart />);
      const message = screen.getByText(
        /start adding items to your cart and they will appear here/i,
      );

      expect(message.className).toContain("text-base");
      expect(message.className).toContain("sm:text-lg");
    });

    it("applies responsive max-width to illustration container", () => {
      render(<EmptyCart />);
      const image = screen.getByAltText("Empty shopping cart");
      const imageContainer = image.parentElement;

      expect(imageContainer?.className).toContain("max-w-xs");
      expect(imageContainer?.className).toContain("sm:max-w-sm");
      expect(imageContainer?.className).toContain("md:max-w-md");
    });
  });

  describe("Dark Mode Support", () => {
    it("applies dark mode text classes to heading", () => {
      render(<EmptyCart />);
      const heading = screen.getByRole("heading", {
        name: /your cart is empty/i,
      });

      expect(heading.className).toContain("text-slate-900");
      expect(heading.className).toContain("dark:text-slate-100");
    });

    it("applies dark mode text classes to message", () => {
      render(<EmptyCart />);
      const message = screen.getByText(
        /start adding items to your cart and they will appear here/i,
      );

      expect(message.className).toContain("text-slate-600");
      expect(message.className).toContain("dark:text-slate-400");
    });

    it("button has dark mode focus ring classes", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button.className).toContain("dark:focus:ring-offset-slate-900");
    });
  });

  describe("Layout Structure", () => {
    it("uses centered flex layout", () => {
      const { container } = render(<EmptyCart />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.className).toContain("flex");
      expect(wrapper.className).toContain("flex-col");
      expect(wrapper.className).toContain("items-center");
      expect(wrapper.className).toContain("justify-center");
    });

    it("message container has max-width constraint", () => {
      render(<EmptyCart />);
      const heading = screen.getByRole("heading", {
        name: /your cart is empty/i,
      });
      const messageContainer = heading.parentElement;

      expect(messageContainer?.className).toContain("max-w-md");
      expect(messageContainer?.className).toContain("text-center");
    });

    it("illustration has proper spacing below", () => {
      render(<EmptyCart />);
      const image = screen.getByAltText("Empty shopping cart");
      const imageContainer = image.parentElement;

      expect(imageContainer?.className).toContain("mb-8");
    });

    it("message has proper spacing below", () => {
      render(<EmptyCart />);
      const message = screen.getByText(
        /start adding items to your cart and they will appear here/i,
      );

      expect(message.className).toContain("mb-8");
    });
  });

  describe("Accessibility", () => {
    it("button has proper aria-label", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button.getAttribute("aria-label")).toBe("Start shopping");
    });

    it("button is touch-friendly with minimum 44px touch target", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button.className).toContain("min-h-[44px]");
      expect(button.className).toContain("min-w-[44px]");
    });

    it("image has descriptive alt text", () => {
      render(<EmptyCart />);
      const image = screen.getByAltText("Empty shopping cart");
      expect(image.getAttribute("alt")).toBe("Empty shopping cart");
    });

    it("button has focus ring for keyboard navigation", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button.className).toContain("focus:outline-none");
      expect(button.className).toContain("focus:ring-2");
      expect(button.className).toContain("focus:ring-orange-400");
    });
  });

  describe("Professional Styling", () => {
    it("applies Allegro-style shadow to button", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button.className).toContain("shadow-lg");
      expect(button.className).toContain("shadow-orange-500/25");
    });

    it("applies smooth transitions to button", () => {
      const mockCallback = vi.fn();
      render(<EmptyCart onStartShopping={mockCallback} />);

      const button = screen.getByRole("button", { name: /start shopping/i });
      expect(button.className).toContain("transition-colors");
    });

    it("image is responsive with full width", () => {
      const { container } = render(<EmptyCart />);
      const image = container.querySelector('img[alt="Empty shopping cart"]');

      expect(image).toBeTruthy();
      expect(image?.className).toContain("w-full");
      expect(image?.className).toContain("h-auto");
    });
  });
});
