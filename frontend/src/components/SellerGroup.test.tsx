/**
 * Unit tests for SellerGroup component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerGroup from "./SellerGroup";
import type { CartItem, Product } from "../api-types";

const mockProduct1: Product = {
  id: "prod-001",
  sellerId: "seller-123",
  sellerName: "Electronics Plus",
  title: "Wireless Mouse",
  imageUrl: "https://via.placeholder.com/200",
  price: { amount: 9999, currency: "PLN" },
  listPrice: { amount: 14999, currency: "PLN" },
  currency: "PLN",
  availability: { inStock: true, maxOrderable: 50 },
  minQty: 1,
  maxQty: 10,
};

const mockProduct2: Product = {
  id: "prod-002",
  sellerId: "seller-123",
  sellerName: "Electronics Plus",
  title: "USB Cable",
  imageUrl: "https://via.placeholder.com/200",
  price: { amount: 2999, currency: "PLN" },
  currency: "PLN",
  availability: { inStock: true, maxOrderable: 100 },
  minQty: 1,
  maxQty: 20,
};

const mockCartItems: CartItem[] = [
  {
    itemId: "item-001",
    productId: "prod-001",
    quantity: 2,
    price: { amount: 9999, currency: "PLN" },
    listPrice: { amount: 14999, currency: "PLN" },
  },
  {
    itemId: "item-002",
    productId: "prod-002",
    quantity: 1,
    price: { amount: 2999, currency: "PLN" },
  },
];

describe("SellerGroup", () => {
  const mockProducts = new Map<string, Product>([
    [mockProduct1.id!, mockProduct1],
    [mockProduct2.id!, mockProduct2],
  ]);

  const defaultProps = {
    sellerId: "seller-123",
    sellerName: "Electronics Plus",
    items: mockCartItems,
    products: mockProducts,
    onQuantityChange: vi.fn(),
    onRemove: vi.fn(),
  };

  it("renders seller group with header", () => {
    render(<SellerGroup {...defaultProps} />);

    expect(
      screen.getByText("Parcel from Electronics Plus"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("displays all items by default (expanded)", () => {
    render(<SellerGroup {...defaultProps} />);

    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
    expect(screen.getByText("USB Cable")).toBeInTheDocument();
  });

  it("starts collapsed when defaultCollapsed is true", () => {
    render(<SellerGroup {...defaultProps} defaultCollapsed={true} />);

    // Items should not be visible
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();
    expect(screen.queryByText("USB Cable")).not.toBeInTheDocument();
  });

  it("toggles collapse/expand when header is clicked", async () => {
    const user = userEvent.setup();
    render(<SellerGroup {...defaultProps} />);

    const header = screen.getByTestId("seller-group-header");

    // Initially expanded, items visible
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();

    // Click to collapse
    await user.click(header);
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();

    // Click to expand
    await user.click(header);
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
  });

  it("supports keyboard navigation with Enter key", async () => {
    const user = userEvent.setup();
    render(<SellerGroup {...defaultProps} />);

    const header = screen.getByTestId("seller-group-header");
    header.focus();

    // Press Enter to collapse
    await user.keyboard("{Enter}");
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();

    // Press Enter to expand
    await user.keyboard("{Enter}");
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
  });

  it("supports keyboard navigation with Space key", async () => {
    const user = userEvent.setup();
    render(<SellerGroup {...defaultProps} />);

    const header = screen.getByTestId("seller-group-header");
    header.focus();

    // Press Space to collapse
    await user.keyboard(" ");
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();

    // Press Space to expand
    await user.keyboard(" ");
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
  });

  it("expands when ArrowRight is pressed while collapsed", async () => {
    const user = userEvent.setup();
    render(<SellerGroup {...defaultProps} defaultCollapsed={true} />);

    const header = screen.getByTestId("seller-group-header");
    header.focus();

    // Items not visible initially
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();

    // Press ArrowRight to expand
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
  });

  it("collapses when ArrowLeft is pressed while expanded", async () => {
    const user = userEvent.setup();
    render(<SellerGroup {...defaultProps} />);

    const header = screen.getByTestId("seller-group-header");
    header.focus();

    // Items visible initially
    expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();

    // Press ArrowLeft to collapse
    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();
  });

  it("has proper ARIA attributes", () => {
    render(<SellerGroup {...defaultProps} />);

    const header = screen.getByTestId("seller-group-header");

    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(header).toHaveAttribute("aria-controls");
  });

  it("updates ARIA attributes when collapsed", async () => {
    const user = userEvent.setup();
    render(<SellerGroup {...defaultProps} />);

    const header = screen.getByTestId("seller-group-header");

    // Initially expanded
    expect(header).toHaveAttribute("aria-expanded", "true");

    // Collapse
    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  it("displays item count correctly for single item", () => {
    render(<SellerGroup {...defaultProps} items={[mockCartItems[0]]} />);

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });

  it("displays item count correctly for multiple items", () => {
    render(<SellerGroup {...defaultProps} />);

    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("passes onQuantityChange callback to CartItem", async () => {
    const user = userEvent.setup();
    const onQuantityChange = vi.fn();

    render(
      <SellerGroup {...defaultProps} onQuantityChange={onQuantityChange} />,
    );

    // Find increment button for first item
    const incrementButtons = screen.getAllByTestId("increment-button");
    await user.click(incrementButtons[0]);

    expect(onQuantityChange).toHaveBeenCalledWith("item-001", 3);
  });

  it("passes onRemove callback to CartItem", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<SellerGroup {...defaultProps} onRemove={onRemove} />);

    // Find remove button for first item
    const removeButtons = screen.getAllByTestId("remove-button");
    await user.click(removeButtons[0]);

    expect(onRemove).toHaveBeenCalledWith("item-001");
  });

  it("passes updatingItems set to CartItem", () => {
    const updatingItems = new Set(["item-001"]);

    render(<SellerGroup {...defaultProps} updatingItems={updatingItems} />);

    // The increment button for item-001 should be disabled
    const incrementButtons = screen.getAllByTestId("increment-button");
    expect(incrementButtons[0]).toBeDisabled();
  });

  it("passes removingItems set to CartItem", () => {
    const removingItems = new Set(["item-002"]);

    render(<SellerGroup {...defaultProps} removingItems={removingItems} />);

    // The second cart item should have reduced opacity
    const cartItem = screen.getByTestId("cart-item-item-002");
    expect(cartItem).toHaveClass("opacity-50");
  });

  it("handles missing product gracefully", () => {
    const itemsWithMissingProduct: CartItem[] = [
      {
        itemId: "item-003",
        productId: "prod-999", // Non-existent product
        quantity: 1,
        price: { amount: 5000, currency: "PLN" },
      },
    ];

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<SellerGroup {...defaultProps} items={itemsWithMissingProduct} />);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Product not found"),
    );

    consoleSpy.mockRestore();
  });

  it("displays master checkbox (visual only)", () => {
    render(<SellerGroup {...defaultProps} />);

    // Master checkbox should be present but marked as presentation
    const checkbox = screen.getByRole("presentation");
    expect(checkbox).toBeInTheDocument();
  });

  it("rotates collapse icon when group is collapsed", async () => {
    const user = userEvent.setup();
    render(<SellerGroup {...defaultProps} />);

    const header = screen.getByTestId("seller-group-header");
    const icon = header.querySelector("svg");

    // Initially expanded, no rotation
    expect(icon).not.toHaveClass("-rotate-90");

    // Collapse
    await user.click(header);
    expect(icon).toHaveClass("-rotate-90");

    // Expand
    await user.click(header);
    expect(icon).not.toHaveClass("-rotate-90");
  });
});
