import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import SellerGroup from "./SellerGroup";
import type { CartItemResponse } from "../api-types";

describe("SellerGroup", () => {
  const mockItems: CartItemResponse[] = [
    {
      id: "item-1",
      cartId: "cart-123",
      sellerId: "seller-1",
      productImage: "https://example.com/product1.jpg",
      productTitle: "Wireless Mouse",
      pricePerUnit: 29.99,
      quantity: 1,
      totalPrice: 29.99,
    },
    {
      id: "item-2",
      cartId: "cart-123",
      sellerId: "seller-1",
      productImage: "https://example.com/product2.jpg",
      productTitle: "Keyboard",
      pricePerUnit: 89.99,
      quantity: 2,
      totalPrice: 179.98,
    },
    {
      id: "item-3",
      cartId: "cart-123",
      sellerId: "seller-1",
      productTitle: "USB Cable",
      pricePerUnit: 9.99,
      quantity: 1,
      totalPrice: 9.99,
    },
  ];

  afterEach(() => {
    cleanup();
  });

  describe("Seller Header", () => {
    it("displays seller name", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore Electronics"
          items={mockItems}
        />,
      );

      expect(within(container).getByText("TechStore Electronics")).toBeTruthy();
    });

    it("displays item count in singular form", () => {
      const singleItem = [mockItems[0]];
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={singleItem}
        />,
      );

      expect(within(container).getByText(/1 item/)).toBeTruthy();
    });

    it("displays item count in plural form", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      expect(within(container).getByText(/3 items/)).toBeTruthy();
    });

    it("displays selected count when items are selected", () => {
      const selectedItems = new Set(["item-1", "item-2"]);
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={selectedItems}
        />,
      );

      expect(within(container).getByText(/2 selected/)).toBeTruthy();
    });

    it("does not display selected count when no items are selected", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={new Set()}
        />,
      );

      expect(within(container).queryByText(/selected/)).toBeFalsy();
    });
  });

  describe("Seller Checkbox", () => {
    it("renders seller checkbox with proper label", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items from techstore/i,
      });
      expect(checkbox).toBeTruthy();
    });

    it("is unchecked when no items are selected", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={new Set()}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      }) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(false);
    });

    it("is checked when all items are selected", () => {
      const allSelected = new Set(["item-1", "item-2", "item-3"]);
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={allSelected}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(false);
    });

    it("is indeterminate when some items are selected", () => {
      const partialSelected = new Set(["item-1", "item-2"]);
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={partialSelected}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      }) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(true);
    });

    it("calls onSellerSelectionChange when clicked", async () => {
      const user = userEvent.setup();
      const onSellerSelectionChange = vi.fn();

      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          onSellerSelectionChange={onSellerSelectionChange}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      });
      await user.click(checkbox);

      expect(onSellerSelectionChange).toHaveBeenCalledWith("seller-1", true);
    });

    it("calls onSelectionChange for all items when selecting all", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          onSelectionChange={onSelectionChange}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      });
      await user.click(checkbox);

      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      expect(onSelectionChange).toHaveBeenCalledWith("item-1", true);
      expect(onSelectionChange).toHaveBeenCalledWith("item-2", true);
      expect(onSelectionChange).toHaveBeenCalledWith("item-3", true);
    });

    it("calls onSelectionChange for all items when deselecting all", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      const allSelected = new Set(["item-1", "item-2", "item-3"]);

      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={allSelected}
          onSelectionChange={onSelectionChange}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      });
      await user.click(checkbox);

      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      expect(onSelectionChange).toHaveBeenCalledWith("item-1", false);
      expect(onSelectionChange).toHaveBeenCalledWith("item-2", false);
      expect(onSelectionChange).toHaveBeenCalledWith("item-3", false);
    });
  });

  describe("Cart Items Rendering", () => {
    it("renders all cart items", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      expect(within(container).getByText("Wireless Mouse")).toBeTruthy();
      expect(within(container).getByText("Keyboard")).toBeTruthy();
      expect(within(container).getByText("USB Cable")).toBeTruthy();
    });

    it("passes isSelected prop correctly to CartItem", () => {
      const selectedItems = new Set(["item-1", "item-3"]);
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={selectedItems}
        />,
      );

      const checkboxes = within(container).getAllByRole("checkbox");
      // First checkbox is the seller checkbox, rest are item checkboxes
      // Item 1 (Wireless Mouse) - should be checked
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
      // Item 2 (Keyboard) - should not be checked
      expect((checkboxes[2] as HTMLInputElement).checked).toBe(false);
      // Item 3 (USB Cable) - should be checked
      expect((checkboxes[3] as HTMLInputElement).checked).toBe(true);
    });

    it("passes onSelectionChange to CartItem", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          onSelectionChange={onSelectionChange}
        />,
      );

      // Find the checkbox for the first item (skip the seller checkbox)
      const itemCheckboxes = within(container).getAllByRole("checkbox");
      await user.click(itemCheckboxes[1]); // Click first item checkbox

      expect(onSelectionChange).toHaveBeenCalledWith("item-1", true);
    });

    it("passes onQuantityChange to CartItem", async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();

      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          onQuantityChange={onQuantityChange}
        />,
      );

      // Find increment button for first item
      const incrementButtons = within(container).getAllByRole("button", {
        name: /increase quantity/i,
      });
      await user.click(incrementButtons[0]);

      expect(onQuantityChange).toHaveBeenCalledWith("item-1", 2);
    });

    it("passes onRemove to CartItem", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          onRemove={onRemove}
        />,
      );

      // Click first item's remove button
      const removeButtons = within(container).getAllByRole("button", {
        name: /remove wireless mouse/i,
      });
      await user.click(removeButtons[0]);

      // Confirm removal in dialog
      const confirmButton = screen.getByRole("button", { name: /^remove$/i });
      await user.click(confirmButton);

      expect(onRemove).toHaveBeenCalledWith("item-1");
    });
  });

  describe("Responsive Design", () => {
    it("applies proper container styles for grouping", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      const mainContainer = container.querySelector(
        'div[class*="bg-white"]',
      ) as HTMLElement;
      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("rounded-lg");
      expect(mainContainer.className).toContain("border");
    });

    it("has dividers between cart items", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      const itemsContainer = container.querySelector(
        'div[class*="divide-y"]',
      ) as HTMLElement;
      expect(itemsContainer).toBeTruthy();
      expect(itemsContainer.className).toContain("divide-slate-");
    });
  });

  describe("Dark Mode Support", () => {
    it("has dark mode classes for main container", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      const mainContainer = container.querySelector(
        'div[class*="bg-white"]',
      ) as HTMLElement;
      expect(mainContainer.className).toContain("dark:bg-slate-");
      expect(mainContainer.className).toContain("dark:border-slate-");
    });

    it("has dark mode classes for seller header", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      const header = container.querySelector(
        'div[class*="bg-slate-50"]',
      ) as HTMLElement;
      expect(header.className).toContain("dark:bg-slate-");
    });

    it("has dark mode classes for text elements", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      const sellerName = within(container).getByText("TechStore");
      expect(sellerName.className).toContain("dark:text-slate-");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA label for seller checkbox", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore Electronics"
          items={mockItems}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items from techstore electronics/i,
      });
      expect(checkbox).toBeTruthy();
    });

    it("has touch-friendly checkbox size", () => {
      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      });
      expect(checkbox.className).toContain("w-5");
      expect(checkbox.className).toContain("h-5");
      expect(checkbox.className).toContain("touch-manipulation");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty items array", () => {
      const { container } = render(
        <SellerGroup sellerId="seller-1" sellerName="TechStore" items={[]} />,
      );

      expect(within(container).getByText("TechStore")).toBeTruthy();
      expect(within(container).getByText(/0 items/)).toBeTruthy();

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      }) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(false);
    });

    it("handles items without IDs gracefully", () => {
      const itemsWithoutIds: CartItemResponse[] = [
        {
          productTitle: "Test Product",
          sellerId: "seller-1",
        },
      ];

      const { container } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={itemsWithoutIds}
        />,
      );

      expect(within(container).getByText("Test Product")).toBeTruthy();
    });

    it("updates indeterminate state when selection changes", () => {
      const { container, rerender } = render(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={new Set()}
        />,
      );

      const checkbox = within(container).getByRole("checkbox", {
        name: /select all items/i,
      }) as HTMLInputElement;

      // Initially unchecked
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(false);

      // Rerender with partial selection
      rerender(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={new Set(["item-1"])}
        />,
      );

      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(true);

      // Rerender with all selected
      rerender(
        <SellerGroup
          sellerId="seller-1"
          sellerName="TechStore"
          items={mockItems}
          selectedItemIds={new Set(["item-1", "item-2", "item-3"])}
        />,
      );

      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(false);
    });
  });
});
