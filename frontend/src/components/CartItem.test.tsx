import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import CartItem from "./CartItem";
import type { CartItemResponse } from "../api-types";

describe("CartItem", () => {
  const mockItem: CartItemResponse = {
    id: "item-123",
    cartId: "cart-456",
    sellerId: "seller-789",
    productImage: "https://example.com/product.jpg",
    productTitle: "Wireless Mouse",
    pricePerUnit: 29.99,
    quantity: 1,
    totalPrice: 29.99,
  };

  afterEach(() => {
    cleanup();
  });

  it("renders product image when available", () => {
    render(<CartItem item={mockItem} />);
    const image = screen.getByRole("img", { name: /wireless mouse/i });
    expect(image).toBeTruthy();
    expect((image as HTMLImageElement).src).toBe(mockItem.productImage);
  });

  it("renders placeholder when product image is not available", () => {
    const itemWithoutImage = { ...mockItem, productImage: undefined };
    const { container } = render(<CartItem item={itemWithoutImage} />);
    // Check that the placeholder div with SVG icon exists
    const placeholder = container.querySelector('svg[aria-hidden="true"]');
    expect(placeholder).toBeTruthy();
  });

  it("displays product title", () => {
    const { container } = render(<CartItem item={mockItem} />);
    expect(within(container).getByText("Wireless Mouse")).toBeTruthy();
  });

  it("displays product title truncated with CSS", () => {
    const { container } = render(<CartItem item={mockItem} />);
    const title = within(container).getByText("Wireless Mouse");
    expect(title.className).toContain("truncate");
  });

  describe("Price Display", () => {
    it("shows only price per unit when quantity is 1", () => {
      const { container } = render(<CartItem item={mockItem} />);
      expect(within(container).getByText(/29\.99 PLN/)).toBeTruthy();
      expect(within(container).queryByText(/\/ item/)).toBeFalsy();
    });

    it("shows price per unit with smaller font when quantity > 1", () => {
      const itemWithMultipleQuantity = {
        ...mockItem,
        quantity: 3,
        totalPrice: 89.97,
      };
      const { container } = render(
        <CartItem item={itemWithMultipleQuantity} />,
      );

      const pricePerUnit = within(container).getByText(/29\.99 PLN \/ item/);
      expect(pricePerUnit).toBeTruthy();
      expect(pricePerUnit.className).toContain("text-xs");
    });

    it("shows total price when quantity > 1", () => {
      const itemWithMultipleQuantity = {
        ...mockItem,
        quantity: 3,
        totalPrice: 89.97,
      };
      const { container } = render(
        <CartItem item={itemWithMultipleQuantity} />,
      );

      expect(within(container).getByText(/89\.97 PLN/)).toBeTruthy();
    });

    it("does not show total price when quantity is 1", () => {
      const { container } = render(<CartItem item={mockItem} />);
      // Should only have one price element with "PLN"
      const priceElements = within(container).getAllByText(/PLN/);
      expect(priceElements.length).toBe(1);
    });
  });

  describe("Selection Checkbox", () => {
    it("renders checkbox unchecked by default", () => {
      const { container } = render(<CartItem item={mockItem} />);
      const checkbox = within(container).getByRole("checkbox", {
        name: /select wireless mouse/i,
      });
      expect(checkbox).toBeTruthy();
      expect((checkbox as HTMLInputElement).checked).toBe(false);
    });

    it("renders checkbox checked when isSelected is true", () => {
      const { container } = render(
        <CartItem item={mockItem} isSelected={true} />,
      );
      const checkbox = within(container).getByRole("checkbox");
      expect((checkbox as HTMLInputElement).checked).toBe(true);
    });

    it("calls onSelectionChange when checkbox is clicked", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      const { container } = render(
        <CartItem item={mockItem} onSelectionChange={onSelectionChange} />,
      );

      const checkbox = within(container).getByRole("checkbox");
      await user.click(checkbox);

      expect(onSelectionChange).toHaveBeenCalledWith("item-123", true);
    });

    it("calls onSelectionChange with false when unchecking", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      const { container } = render(
        <CartItem
          item={mockItem}
          isSelected={true}
          onSelectionChange={onSelectionChange}
        />,
      );

      const checkbox = within(container).getByRole("checkbox");
      await user.click(checkbox);

      expect(onSelectionChange).toHaveBeenCalledWith("item-123", false);
    });
  });

  describe("Quantity Selector", () => {
    it("displays current quantity", () => {
      const itemWithQuantity = { ...mockItem, quantity: 5 };
      const { container } = render(<CartItem item={itemWithQuantity} />);
      expect(within(container).getByText("5")).toBeTruthy();
    });

    it("increments quantity when + button is clicked", async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();

      const { container } = render(
        <CartItem item={mockItem} onQuantityChange={onQuantityChange} />,
      );

      const incrementButton = within(container).getByRole("button", {
        name: /increase quantity/i,
      });
      await user.click(incrementButton);

      expect(onQuantityChange).toHaveBeenCalledWith("item-123", 2);
    });

    it("decrements quantity when - button is clicked", async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      const itemWithQuantity = { ...mockItem, quantity: 3 };

      const { container } = render(
        <CartItem
          item={itemWithQuantity}
          onQuantityChange={onQuantityChange}
        />,
      );

      const decrementButton = within(container).getByRole("button", {
        name: /decrease quantity/i,
      });
      await user.click(decrementButton);

      expect(onQuantityChange).toHaveBeenCalledWith("item-123", 2);
    });

    it("disables decrement button when quantity is 1", () => {
      const { container } = render(<CartItem item={mockItem} />);

      const decrementButton = within(container).getByRole("button", {
        name: /decrease quantity/i,
      });
      expect((decrementButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables increment button when quantity is 99", () => {
      const itemAtMax = { ...mockItem, quantity: 99 };
      const { container } = render(<CartItem item={itemAtMax} />);

      const incrementButton = within(container).getByRole("button", {
        name: /increase quantity/i,
      });
      expect((incrementButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("does not call onQuantityChange when trying to go below 1", async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();

      const { container } = render(
        <CartItem item={mockItem} onQuantityChange={onQuantityChange} />,
      );

      const decrementButton = within(container).getByRole("button", {
        name: /decrease quantity/i,
      });
      await user.click(decrementButton);

      expect(onQuantityChange).not.toHaveBeenCalled();
    });

    it("does not call onQuantityChange when trying to go above 99", async () => {
      const user = userEvent.setup();
      const onQuantityChange = vi.fn();
      const itemAtMax = { ...mockItem, quantity: 99 };

      const { container } = render(
        <CartItem item={itemAtMax} onQuantityChange={onQuantityChange} />,
      );

      const incrementButton = within(container).getByRole("button", {
        name: /increase quantity/i,
      });
      await user.click(incrementButton);

      expect(onQuantityChange).not.toHaveBeenCalled();
    });
  });

  describe("Remove Functionality", () => {
    it("shows confirmation dialog when remove button is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(<CartItem item={mockItem} />);

      // Click the first remove button
      const removeButtons = within(container).getAllByRole("button", {
        name: /remove wireless mouse/i,
      });
      await user.click(removeButtons[0]);

      // Check that confirmation dialog appears
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(screen.getByText(/are you sure you want to remove/i)).toBeTruthy();
    });

    it("calls onRemove when confirmed", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      const { container } = render(
        <CartItem item={mockItem} onRemove={onRemove} />,
      );

      // Click remove button
      const removeButtons = within(container).getAllByRole("button", {
        name: /remove wireless mouse/i,
      });
      await user.click(removeButtons[0]);

      // Confirm removal
      const confirmButton = screen.getByRole("button", { name: /^remove$/i });
      await user.click(confirmButton);

      expect(onRemove).toHaveBeenCalledWith("item-123");
    });

    it("does not call onRemove when cancelled", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      const { container } = render(
        <CartItem item={mockItem} onRemove={onRemove} />,
      );

      // Click remove button
      const removeButtons = within(container).getAllByRole("button", {
        name: /remove wireless mouse/i,
      });
      await user.click(removeButtons[0]);

      // Cancel removal
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(onRemove).not.toHaveBeenCalled();
    });

    it("hides confirmation dialog when cancelled", async () => {
      const user = userEvent.setup();
      const { container } = render(<CartItem item={mockItem} />);

      // Click remove button
      const removeButtons = within(container).getAllByRole("button", {
        name: /remove wireless mouse/i,
      });
      await user.click(removeButtons[0]);

      // Dialog should be visible
      expect(screen.getByRole("dialog")).toBeTruthy();

      // Cancel removal
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should be hidden
      expect(screen.queryByRole("dialog")).toBeFalsy();
    });
  });

  describe("Responsive Design", () => {
    it("renders both desktop and mobile remove buttons", () => {
      const { container } = render(<CartItem item={mockItem} />);

      const removeButtons = within(container).getAllByRole("button", {
        name: /remove wireless mouse/i,
      });
      // One for desktop (sm:block) and one for mobile (sm:hidden)
      expect(removeButtons.length).toBe(2);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for buttons", () => {
      const { container } = render(<CartItem item={mockItem} />);

      expect(
        within(container).getByRole("button", { name: /increase quantity/i }),
      ).toBeTruthy();
      expect(
        within(container).getByRole("button", { name: /decrease quantity/i }),
      ).toBeTruthy();
      expect(
        within(container).getByRole("checkbox", {
          name: /select wireless mouse/i,
        }),
      ).toBeTruthy();
    });

    it("has proper dialog ARIA attributes", async () => {
      const user = userEvent.setup();
      const { container } = render(<CartItem item={mockItem} />);

      const removeButtons = within(container).getAllByRole("button", {
        name: /remove wireless mouse/i,
      });
      await user.click(removeButtons[0]);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeTruthy();
      expect(dialog.getAttribute("aria-labelledby")).toBe(
        "remove-dialog-title",
      );
      expect(dialog.getAttribute("aria-describedby")).toBe(
        "remove-dialog-description",
      );
    });

    it("has touch-friendly button sizes with min-w and min-h classes", () => {
      const { container } = render(<CartItem item={mockItem} />);

      const incrementButton = within(container).getByRole("button", {
        name: /increase quantity/i,
      });
      const decrementButton = within(container).getByRole("button", {
        name: /decrease quantity/i,
      });

      expect(incrementButton.className).toContain("min-w-");
      expect(incrementButton.className).toContain("min-h-");
      expect(decrementButton.className).toContain("min-w-");
      expect(decrementButton.className).toContain("min-h-");
    });
  });

  describe("Dark Mode Support", () => {
    it("has dark mode classes for container", () => {
      const { container } = render(<CartItem item={mockItem} />);

      // Check the main container has dark mode classes
      const mainContainer = within(container)
        .getByRole("checkbox")
        .closest('div[class*="bg-white"]');
      expect(mainContainer?.className).toContain("dark:bg-slate-");
      expect(mainContainer?.className).toContain("dark:border-slate-");
    });

    it("has dark mode classes for text elements", () => {
      const { container } = render(<CartItem item={mockItem} />);

      const title = within(container).getByText("Wireless Mouse");
      expect(title.className).toContain("dark:text-slate-");
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional fields gracefully", () => {
      const minimalItem: CartItemResponse = {
        id: "item-123",
        productTitle: "Test Product",
      };
      const { container } = render(<CartItem item={minimalItem} />);

      expect(within(container).getByText("Test Product")).toBeTruthy();
      // Check quantity display
      const quantityDisplay = within(container)
        .getAllByText("1")
        .find(
          (el) =>
            el.hasAttribute("aria-label") &&
            el.getAttribute("aria-label")?.includes("Quantity"),
        );
      expect(quantityDisplay).toBeTruthy();
    });

    it("calculates totalPrice when not provided", () => {
      const itemWithoutTotal = {
        ...mockItem,
        quantity: 2,
        totalPrice: undefined,
      };
      const { container } = render(<CartItem item={itemWithoutTotal} />);

      // Should calculate 29.99 * 2 = 59.98
      expect(within(container).getByText(/59\.98 PLN/)).toBeTruthy();
    });

    it("handles undefined quantity by defaulting to 1", () => {
      const itemWithoutQuantity = { ...mockItem, quantity: undefined };
      const { container } = render(<CartItem item={itemWithoutQuantity} />);

      // Check quantity display
      const quantityDisplay = within(container)
        .getAllByText("1")
        .find(
          (el) =>
            el.hasAttribute("aria-label") &&
            el.getAttribute("aria-label")?.includes("Quantity"),
        );
      expect(quantityDisplay).toBeTruthy();
    });
  });
});
