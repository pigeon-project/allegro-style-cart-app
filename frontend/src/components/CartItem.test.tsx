import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartItem from "./CartItem";
import type { CartItem as CartItemType, Product } from "../api-types";

describe("CartItem", () => {
  const mockProduct: Product = {
    id: "prod-001",
    sellerId: "seller-123",
    sellerName: "Electronics Plus",
    title: "Wireless Mouse",
    imageUrl: "https://example.com/mouse.jpg",
    attributes: [{ Color: "Black" }, { Connectivity: "Bluetooth" }],
    price: { amount: 9999, currency: "PLN" }, // 99.99 PLN
    listPrice: { amount: 12999, currency: "PLN" }, // 129.99 PLN
    currency: "PLN",
    availability: { inStock: true, maxOrderable: 50 },
    minQty: 1,
    maxQty: 10,
  };

  const mockCartItem: CartItemType = {
    itemId: "item-001",
    productId: "prod-001",
    quantity: 2,
    price: { amount: 9999, currency: "PLN" },
    listPrice: { amount: 12999, currency: "PLN" },
  };

  const mockOnQuantityChange = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders cart item with all required fields", () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    // Check thumbnail
    const image = screen.getByAltText("Wireless Mouse");
    expect(image.getAttribute("src")).toBe("https://example.com/mouse.jpg");

    // Check title
    expect(screen.getByText("Wireless Mouse")).toBeTruthy();

    // Check seller name
    expect(screen.getByText("Electronics Plus")).toBeTruthy();

    // Check attributes
    expect(screen.getByTestId("attribute-0").textContent).toContain(
      "Color: Black",
    );
    expect(screen.getByTestId("attribute-1").textContent).toContain(
      "Connectivity: Bluetooth",
    );

    // Check unit price
    expect(screen.getByLabelText("Current price").textContent).toContain(
      "99.99 PLN",
    );

    // Check original price (crossed out)
    expect(screen.getByLabelText("Original price").textContent).toContain(
      "129.99 PLN",
    );

    // Check quantity
    const quantityInput = screen.getByTestId(
      "quantity-input",
    ) as HTMLInputElement;
    expect(quantityInput.value).toBe("2");

    // Check line total (99.99 * 2 = 199.98)
    expect(screen.getByTestId("line-total").textContent).toContain(
      "199.98 PLN",
    );

    // Check savings (129.99 - 99.99) * 2 = 60.00
    expect(screen.getByTestId("savings").textContent).toContain(
      "Save 60.00 PLN",
    );
  });

  it("increments quantity when increment button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const incrementButton = screen.getByTestId("increment-button");
    await user.click(incrementButton);

    expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 3);
  });

  it("decrements quantity when decrement button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const decrementButton = screen.getByTestId("decrement-button");
    await user.click(decrementButton);

    expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 1);
  });

  it("disables decrement button when quantity is at minimum", async () => {
    const user = userEvent.setup();
    const itemAtMin = { ...mockCartItem, quantity: 1 };

    render(
      <CartItem
        item={itemAtMin}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const decrementButton = screen.getByTestId("decrement-button");
    expect(
      (decrementButton as HTMLButtonElement | HTMLInputElement).disabled,
    ).toBe(true);

    await user.click(decrementButton);
    expect(mockOnQuantityChange).not.toHaveBeenCalled();
  });

  it("disables increment button when quantity is at maximum", async () => {
    const user = userEvent.setup();
    const itemAtMax = { ...mockCartItem, quantity: 10 };

    render(
      <CartItem
        item={itemAtMax}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const incrementButton = screen.getByTestId("increment-button");
    expect(
      (incrementButton as HTMLButtonElement | HTMLInputElement).disabled,
    ).toBe(true);

    await user.click(incrementButton);
    expect(mockOnQuantityChange).not.toHaveBeenCalled();
  });

  it("respects maxOrderable from availability", async () => {
    const user = userEvent.setup();
    const limitedProduct = {
      ...mockProduct,
      maxQty: 100,
      availability: { inStock: true, maxOrderable: 5 },
    };
    const itemNearLimit = { ...mockCartItem, quantity: 5 };

    render(
      <CartItem
        item={itemNearLimit}
        product={limitedProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const incrementButton = screen.getByTestId("increment-button");
    expect(
      (incrementButton as HTMLButtonElement | HTMLInputElement).disabled,
    ).toBe(true);

    await user.click(incrementButton);
    expect(mockOnQuantityChange).not.toHaveBeenCalled();
  });

  it("allows manual quantity input", async () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const quantityInput = screen.getByTestId(
      "quantity-input",
    ) as HTMLInputElement;

    // Simulate user typing a valid value
    fireEvent.change(quantityInput, { target: { value: "5" } });

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 5);
    });
  });

  it("clips manual input to min quantity", async () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const quantityInput = screen.getByTestId(
      "quantity-input",
    ) as HTMLInputElement;

    // Simulate user typing a value below minimum
    fireEvent.change(quantityInput, { target: { value: "0" } });

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 1);
    });
  });

  it("clips manual input to max quantity", async () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const quantityInput = screen.getByTestId(
      "quantity-input",
    ) as HTMLInputElement;

    // Simulate user typing a value above maximum
    fireEvent.change(quantityInput, { target: { value: "100" } });

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 10);
    });
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const removeButton = screen.getByTestId("remove-button");
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith("item-001");
  });

  it("supports keyboard navigation - arrow up increases quantity", async () => {
    const user = userEvent.setup();

    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const quantityInput = screen.getByTestId("quantity-input");
    quantityInput.focus();
    await user.keyboard("{ArrowUp}");

    expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 3);
  });

  it("supports keyboard navigation - arrow down decreases quantity", async () => {
    const user = userEvent.setup();

    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const quantityInput = screen.getByTestId("quantity-input");
    quantityInput.focus();
    await user.keyboard("{ArrowDown}");

    expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 1);
  });

  it("supports keyboard navigation - plus key increases quantity", async () => {
    const user = userEvent.setup();

    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const quantityInput = screen.getByTestId("quantity-input");
    quantityInput.focus();
    await user.keyboard("{+}");

    expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 3);
  });

  it("supports keyboard navigation - minus key decreases quantity", async () => {
    const user = userEvent.setup();

    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const quantityInput = screen.getByTestId("quantity-input");
    quantityInput.focus();
    await user.keyboard("{-}");

    expect(mockOnQuantityChange).toHaveBeenCalledWith("item-001", 1);
  });

  it("has proper ARIA labels for accessibility", () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    // Check article role
    expect(screen.getByRole("article").getAttribute("aria-label")).toBe(
      "Cart item: Wireless Mouse",
    );

    // Check quantity controls group
    expect(screen.getByRole("group").getAttribute("aria-label")).toBe(
      "Quantity controls",
    );

    // Check quantity input ARIA attributes
    const quantityInput = screen.getByTestId("quantity-input");
    expect(quantityInput.getAttribute("aria-valuemin")).toBe("1");
    expect(quantityInput.getAttribute("aria-valuemax")).toBe("10");
    expect(quantityInput.getAttribute("aria-valuenow")).toBe("2");

    // Check button labels
    expect(
      screen.queryByLabelText("Remove Wireless Mouse from cart"),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Decrease quantity")).toBeTruthy();
    expect(screen.queryByLabelText("Increase quantity")).toBeTruthy();
  });

  it("shows loading state when isUpdating is true", () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
        isUpdating={true}
      />,
    );

    const decrementButton = screen.getByTestId("decrement-button");
    const incrementButton = screen.getByTestId("increment-button");
    const quantityInput = screen.getByTestId("quantity-input");

    expect(
      (decrementButton as HTMLButtonElement | HTMLInputElement).disabled,
    ).toBe(true);
    expect(
      (incrementButton as HTMLButtonElement | HTMLInputElement).disabled,
    ).toBe(true);
    expect(
      (quantityInput as HTMLButtonElement | HTMLInputElement).disabled,
    ).toBe(true);
  });

  it("shows loading state when isRemoving is true", () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
        isRemoving={true}
      />,
    );

    const removeButton = screen.getByTestId("remove-button");
    const container = screen.getByTestId(`cart-item-${mockCartItem.itemId}`);

    expect(
      (removeButton as HTMLButtonElement | HTMLInputElement).disabled,
    ).toBe(true);
    expect(container.className).toContain("opacity-50");
  });

  it("does not show savings when listPrice is not higher than price", () => {
    const itemNoSavings = {
      ...mockCartItem,
      price: { amount: 9999, currency: "PLN" },
      listPrice: { amount: 9999, currency: "PLN" },
    };

    render(
      <CartItem
        item={itemNoSavings}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.queryByTestId("savings")).toBeFalsy();
    expect(screen.queryByLabelText("Original price")).toBeFalsy();
  });

  it("calculates line total correctly", () => {
    const itemWithQuantity5 = { ...mockCartItem, quantity: 5 };

    render(
      <CartItem
        item={itemWithQuantity5}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    // 99.99 * 5 = 499.95
    expect(screen.getByTestId("line-total").textContent).toContain(
      "499.95 PLN",
    );

    // Savings: (129.99 - 99.99) * 5 = 150.00
    expect(screen.getByTestId("savings").textContent).toContain(
      "Save 150.00 PLN",
    );
  });

  it("handles products without attributes", () => {
    const productNoAttributes = { ...mockProduct, attributes: undefined };

    render(
      <CartItem
        item={mockCartItem}
        product={productNoAttributes}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.queryByTestId("attribute-0")).toBeFalsy();
  });

  it("handles products with empty attributes array", () => {
    const productEmptyAttributes = { ...mockProduct, attributes: [] };

    render(
      <CartItem
        item={mockCartItem}
        product={productEmptyAttributes}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.queryByTestId("attribute-0")).toBeFalsy();
  });

  it("has focus rings for keyboard accessibility", () => {
    render(
      <CartItem
        item={mockCartItem}
        product={mockProduct}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />,
    );

    const decrementButton = screen.getByTestId("decrement-button");
    const incrementButton = screen.getByTestId("increment-button");
    const removeButton = screen.getByTestId("remove-button");
    const quantityInput = screen.getByTestId("quantity-input");

    // All interactive elements should have focus styles
    expect(decrementButton.className).toContain("focus:ring");
    expect(incrementButton.className).toContain("focus:ring");
    expect(removeButton.className).toContain("focus:ring");
    expect(quantityInput.className).toContain("focus:ring");
  });
});
