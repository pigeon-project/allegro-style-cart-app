import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CartSummary from "./CartSummary";
import type { CartItemResponse } from "../api-types";

/**
 * Formats a number as PLN currency with Polish number formatting
 * Example: 123.45 -> "123,45 zł"
 */
export function formatPLN(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} zł`;
}

describe("formatPLN", () => {
  it("formats zero correctly", () => {
    expect(formatPLN(0)).toBe("0,00 zł");
  });

  it("formats whole numbers correctly", () => {
    expect(formatPLN(100)).toBe("100,00 zł");
  });

  it("formats decimal numbers correctly with comma separator", () => {
    expect(formatPLN(123.45)).toBe("123,45 zł");
  });

  it("formats single decimal correctly", () => {
    expect(formatPLN(99.9)).toBe("99,90 zł");
  });

  it("formats large numbers correctly", () => {
    expect(formatPLN(1234567.89)).toBe("1234567,89 zł");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatPLN(99.999)).toBe("100,00 zł");
    expect(formatPLN(99.994)).toBe("99,99 zł");
  });
});

describe("CartSummary", () => {
  const mockItems: CartItemResponse[] = [
    {
      id: "item-1",
      cartId: "cart-1",
      sellerId: "seller-1",
      productTitle: "Product 1",
      pricePerUnit: 29.99,
      quantity: 1,
      totalPrice: 29.99,
    },
    {
      id: "item-2",
      cartId: "cart-1",
      sellerId: "seller-1",
      productTitle: "Product 2",
      pricePerUnit: 50.0,
      quantity: 2,
      totalPrice: 100.0,
    },
    {
      id: "item-3",
      cartId: "cart-1",
      sellerId: "seller-2",
      productTitle: "Product 3",
      pricePerUnit: 15.5,
      quantity: 3,
      totalPrice: 46.5,
    },
  ];

  describe("Price Calculation", () => {
    it("calculates total price of selected items", () => {
      const selectedItemIds = new Set(["item-1", "item-2"]);
      render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      // Total should be 29.99 + 100.00 = 129.99
      const priceElements = screen.getAllByText("129,99 zł");
      expect(priceElements.length).toBeGreaterThanOrEqual(2); // At least Desktop + Mobile
    });

    it("shows zero when no items are selected", () => {
      const selectedItemIds = new Set<string>();
      render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      const priceElements = screen.getAllByText("0,00 zł");
      expect(priceElements.length).toBeGreaterThanOrEqual(2); // At least Desktop + Mobile
    });

    it("calculates total for all items when all are selected", () => {
      const selectedItemIds = new Set(["item-1", "item-2", "item-3"]);
      render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      // Total should be 29.99 + 100.00 + 46.50 = 176.49
      const priceElements = screen.getAllByText("176,49 zł");
      expect(priceElements.length).toBeGreaterThanOrEqual(2);
    });

    it("uses totalPrice from item if available", () => {
      const items: CartItemResponse[] = [
        {
          id: "item-1",
          cartId: "cart-1",
          sellerId: "seller-1",
          productTitle: "Product 1",
          pricePerUnit: 10.0,
          quantity: 5,
          totalPrice: 50.0,
        },
      ];
      const selectedItemIds = new Set(["item-1"]);
      render(<CartSummary items={items} selectedItemIds={selectedItemIds} />);

      const priceElements = screen.getAllByText("50,00 zł");
      expect(priceElements.length).toBeGreaterThanOrEqual(2);
    });

    it("calculates from pricePerUnit and quantity when totalPrice is missing", () => {
      const items: CartItemResponse[] = [
        {
          id: "item-1",
          cartId: "cart-1",
          sellerId: "seller-1",
          productTitle: "Product 1",
          pricePerUnit: 10.0,
          quantity: 5,
          // totalPrice is undefined
        },
      ];
      const selectedItemIds = new Set(["item-1"]);
      render(<CartSummary items={items} selectedItemIds={selectedItemIds} />);

      // Should calculate as 10.0 * 5 = 50.0
      const priceElements = screen.getAllByText("50,00 zł");
      expect(priceElements.length).toBeGreaterThanOrEqual(2);
    });

    it("handles missing pricePerUnit gracefully", () => {
      const items: CartItemResponse[] = [
        {
          id: "item-1",
          cartId: "cart-1",
          sellerId: "seller-1",
          productTitle: "Product 1",
          quantity: 5,
        },
      ];
      const selectedItemIds = new Set(["item-1"]);
      render(<CartSummary items={items} selectedItemIds={selectedItemIds} />);

      const priceElements = screen.getAllByText("0,00 zł");
      expect(priceElements.length).toBeGreaterThanOrEqual(2);
    });

    it("handles missing quantity gracefully", () => {
      const items: CartItemResponse[] = [
        {
          id: "item-1",
          cartId: "cart-1",
          sellerId: "seller-1",
          productTitle: "Product 1",
          pricePerUnit: 10.0,
        },
      ];
      const selectedItemIds = new Set(["item-1"]);
      render(<CartSummary items={items} selectedItemIds={selectedItemIds} />);

      // Should use quantity = 1 as default
      const priceElements = screen.getAllByText("10,00 zł");
      expect(priceElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Dynamic Updates", () => {
    it("updates when different items are selected", () => {
      const selectedItemIds = new Set(["item-1"]);
      const { rerender } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(screen.getAllByText("29,99 zł").length).toBeGreaterThanOrEqual(2);

      // Select different item
      const newSelectedIds = new Set(["item-2"]);
      rerender(
        <CartSummary items={mockItems} selectedItemIds={newSelectedIds} />,
      );

      expect(screen.getAllByText("100,00 zł").length).toBeGreaterThanOrEqual(2);
    });

    it("updates when quantity changes", () => {
      const selectedItemIds = new Set(["item-1"]);
      const { rerender } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(screen.getAllByText("29,99 zł").length).toBeGreaterThanOrEqual(2);

      // Update quantity
      const updatedItems = mockItems.map((item) =>
        item.id === "item-1"
          ? { ...item, quantity: 2, totalPrice: 59.98 }
          : item,
      );
      rerender(
        <CartSummary items={updatedItems} selectedItemIds={selectedItemIds} />,
      );

      expect(screen.getAllByText("59,98 zł").length).toBeGreaterThanOrEqual(2);
    });

    it("updates when items are added to selection", () => {
      const selectedItemIds = new Set(["item-1"]);
      const { rerender } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(screen.getAllByText("29,99 zł").length).toBeGreaterThanOrEqual(2);

      // Add another item to selection
      const newSelectedIds = new Set(["item-1", "item-2"]);
      rerender(
        <CartSummary items={mockItems} selectedItemIds={newSelectedIds} />,
      );

      expect(screen.getAllByText("129,99 zł").length).toBeGreaterThanOrEqual(2);
    });

    it("updates when items are removed from selection", () => {
      const selectedItemIds = new Set(["item-1", "item-2"]);
      const { rerender } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(screen.getAllByText("129,99 zł").length).toBeGreaterThanOrEqual(2);

      // Remove item from selection
      const newSelectedIds = new Set(["item-1"]);
      rerender(
        <CartSummary items={mockItems} selectedItemIds={newSelectedIds} />,
      );

      expect(screen.getAllByText("29,99 zł").length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Selected Items Count", () => {
    it("displays correct count of selected items", () => {
      const selectedItemIds = new Set(["item-1", "item-2"]);
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      // Desktop count - look for "2" in font-medium span
      const desktopCount = container.querySelector(".font-medium");
      expect(desktopCount?.textContent).toBe("2");

      // Mobile text - look for "2 items selected"
      expect(container.textContent).toContain("2 items selected");
    });

    it("displays singular form for one item", () => {
      const selectedItemIds = new Set(["item-1"]);
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(container.textContent).toContain("1 item selected");
    });

    it("displays plural form for multiple items", () => {
      const selectedItemIds = new Set(["item-1", "item-2", "item-3"]);
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(container.textContent).toContain("3 items selected");
    });

    it("shows zero when no items selected", () => {
      const selectedItemIds = new Set<string>();
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      const desktopCount = container.querySelector(".font-medium");
      expect(desktopCount?.textContent).toBe("0");
      expect(container.textContent).toContain("0 items selected");
    });
  });

  describe("Checkout Button", () => {
    it("enables checkout button when items are selected", () => {
      const selectedItemIds = new Set(["item-1"]);
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Desktop + Mobile
      const enabledButtons = Array.from(buttons).filter(
        (btn) => !btn.hasAttribute("disabled"),
      );
      expect(enabledButtons.length).toBeGreaterThanOrEqual(2);
      enabledButtons.forEach((button) => {
        const text = button.textContent || "";
        expect(/Checkout|Proceed to Checkout/.test(text)).toBe(true);
      });
    });

    it("disables checkout button when no items are selected", () => {
      const selectedItemIds = new Set<string>();
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Desktop + Mobile
      const disabledButtons = Array.from(buttons).filter((btn) =>
        btn.hasAttribute("disabled"),
      );
      expect(disabledButtons.length).toBeGreaterThanOrEqual(2);
      disabledButtons.forEach((button) => {
        const text = button.textContent || "";
        expect(text.includes("Select items")).toBe(true);
      });
    });

    it("has proper aria-label when enabled", () => {
      const selectedItemIds = new Set(["item-1"]);
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      const buttons = Array.from(container.querySelectorAll("button")).filter(
        (btn) => btn.getAttribute("aria-label") === "Proceed to checkout",
      );
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Desktop + Mobile
    });

    it("has proper aria-label when disabled", () => {
      const selectedItemIds = new Set<string>();
      const { container } = render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      const buttons = Array.from(container.querySelectorAll("button")).filter(
        (btn) => btn.getAttribute("aria-label") === "Select items to checkout",
      );
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Desktop + Mobile
    });
  });

  describe("Responsive Layout", () => {
    it("renders both desktop and mobile versions", () => {
      const selectedItemIds = new Set(["item-1"]);
      render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      // Desktop version should have "Order Summary" heading
      expect(
        screen.getAllByText("Order Summary").length,
      ).toBeGreaterThanOrEqual(1);

      // Both versions should show the same price
      expect(screen.getAllByText("29,99 zł").length).toBeGreaterThanOrEqual(2);
    });

    it("shows total label on desktop", () => {
      const selectedItemIds = new Set(["item-1"]);
      render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(screen.getAllByText("Total:").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty items array", () => {
      const selectedItemIds = new Set<string>();
      render(<CartSummary items={[]} selectedItemIds={selectedItemIds} />);

      expect(screen.getAllByText("0,00 zł").length).toBeGreaterThanOrEqual(2);
      expect(
        screen.getAllByText(/0\s+items\s+selected/).length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("handles items without IDs", () => {
      const items: CartItemResponse[] = [
        {
          cartId: "cart-1",
          sellerId: "seller-1",
          productTitle: "Product 1",
          pricePerUnit: 10.0,
          quantity: 1,
          totalPrice: 10.0,
        },
      ];
      const selectedItemIds = new Set(["non-existent-id"]);
      render(<CartSummary items={items} selectedItemIds={selectedItemIds} />);

      // Should show 0 since no items match the selection
      expect(screen.getAllByText("0,00 zł").length).toBeGreaterThanOrEqual(2);
    });

    it("handles selecting non-existent item IDs", () => {
      const selectedItemIds = new Set(["non-existent-1", "non-existent-2"]);
      render(
        <CartSummary items={mockItems} selectedItemIds={selectedItemIds} />,
      );

      expect(screen.getAllByText("0,00 zł").length).toBeGreaterThanOrEqual(2);
      expect(
        screen.getAllByText(/0\s+items\s+selected/).length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("handles very large prices", () => {
      const items: CartItemResponse[] = [
        {
          id: "item-1",
          cartId: "cart-1",
          sellerId: "seller-1",
          productTitle: "Expensive Product",
          pricePerUnit: 999999.99,
          quantity: 1,
          totalPrice: 999999.99,
        },
      ];
      const selectedItemIds = new Set(["item-1"]);
      render(<CartSummary items={items} selectedItemIds={selectedItemIds} />);

      expect(screen.getAllByText("999999,99 zł").length).toBeGreaterThanOrEqual(
        2,
      );
    });

    it("handles fractional cents correctly", () => {
      const items: CartItemResponse[] = [
        {
          id: "item-1",
          cartId: "cart-1",
          sellerId: "seller-1",
          productTitle: "Product 1",
          pricePerUnit: 10.333,
          quantity: 3,
          totalPrice: 30.999,
        },
      ];
      const selectedItemIds = new Set(["item-1"]);
      render(<CartSummary items={items} selectedItemIds={selectedItemIds} />);

      // Should round to 2 decimal places: 31.00
      expect(screen.getAllByText("31,00 zł").length).toBeGreaterThanOrEqual(2);
    });
  });
});
