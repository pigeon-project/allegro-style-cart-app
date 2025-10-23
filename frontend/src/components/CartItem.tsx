/**
 * Cart Item Component
 *
 * Displays a single cart line item with:
 * - Product thumbnail, title, attributes, seller name
 * - Unit price, quantity stepper, line total, remove button
 * - Optimistic UI updates for quantity changes and removal
 * - Full keyboard navigation and ARIA labels for accessibility
 * - Min/max quantity validation
 */

import { useState } from "react";
import type { CartItem as CartItemType, Product } from "../api-types";

export interface CartItemProps {
  /** The cart item data */
  item: CartItemType;
  /** Product details for display */
  product: Product;
  /** Callback when quantity changes */
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  /** Callback when item is removed */
  onRemove: (itemId: string) => void;
  /** Whether the item is being updated */
  isUpdating?: boolean;
  /** Whether the item is being removed */
  isRemoving?: boolean;
}

/**
 * Format price from grosze to PLN
 */
function formatPrice(amount: number): string {
  return (amount / 100).toFixed(2);
}

/**
 * CartItem Component
 *
 * A fully accessible cart line item with quantity controls and remove functionality.
 * Implements WCAG 2.2 AA compliance with keyboard navigation and ARIA labels.
 */
export default function CartItem({
  item,
  product,
  onQuantityChange,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}: CartItemProps) {
  // Local state for optimistic updates
  const [localQuantity, setLocalQuantity] = useState(item.quantity || 1);

  // Calculate constraints
  const minQty = product.minQty || 1;
  const maxQty = Math.min(
    product.maxQty || 99,
    product.availability?.maxOrderable || 99,
  );

  // Calculate line total
  const lineTotal = (item.price?.amount || 0) * localQuantity;
  const listLineTotal = (item.listPrice?.amount || 0) * localQuantity;
  const savings =
    item.listPrice && item.listPrice.amount! > item.price!.amount!
      ? listLineTotal - lineTotal
      : 0;

  const handleDecrement = () => {
    const newQuantity = Math.max(minQty, localQuantity - 1);
    if (newQuantity !== localQuantity) {
      setLocalQuantity(newQuantity);
      onQuantityChange(item.itemId!, newQuantity);
    }
  };

  const handleIncrement = () => {
    const newQuantity = Math.min(maxQty, localQuantity + 1);
    if (newQuantity !== localQuantity) {
      setLocalQuantity(newQuantity);
      onQuantityChange(item.itemId!, newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;

    // Clip to valid range
    const clippedValue = Math.max(minQty, Math.min(maxQty, value));
    setLocalQuantity(clippedValue);
    onQuantityChange(item.itemId!, clippedValue);
  };

  const handleRemove = () => {
    onRemove(item.itemId!);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard navigation for quantity controls
    if (e.key === "ArrowUp" || e.key === "+") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown" || e.key === "-") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const isDecrementDisabled = localQuantity <= minQty || isUpdating;
  const isIncrementDisabled = localQuantity >= maxQty || isUpdating;

  return (
    <div
      className={`bg-surface border border-border rounded-md p-4 transition-opacity ${
        isRemoving ? "opacity-50" : "opacity-100"
      }`}
      data-testid={`cart-item-${item.itemId}`}
      role="article"
      aria-label={`Cart item: ${product.title}`}
    >
      <div className="flex gap-4">
        {/* Product Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={product.title || "Product image"}
            className="w-24 h-24 object-cover rounded-md border border-border"
            loading="lazy"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              {/* Title */}
              <h3 className="text-base font-semibold text-text mb-1 line-clamp-2">
                {product.title}
              </h3>

              {/* Seller Name */}
              <p className="text-sm text-text-secondary mb-2">
                {product.sellerName}
              </p>

              {/* Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="space-y-1 mb-3">
                  {product.attributes.map((attr, index) => (
                    <p
                      key={index}
                      className="text-xs text-text-secondary"
                      data-testid={`attribute-${index}`}
                    >
                      <span className="font-medium">
                        {Object.keys(attr)[0]}:
                      </span>{" "}
                      {Object.values(attr)[0]}
                    </p>
                  ))}
                </div>
              )}

              {/* Unit Price */}
              <div className="flex items-baseline gap-2 mb-3">
                {item.listPrice &&
                  item.listPrice.amount! > item.price!.amount! && (
                    <span
                      className="text-sm text-text-secondary line-through"
                      aria-label="Original price"
                    >
                      {formatPrice(item.listPrice.amount!)} PLN
                    </span>
                  )}
                <span
                  className="text-base font-semibold text-navy-500 dark:text-white"
                  aria-label="Current price"
                >
                  {formatPrice(item.price?.amount || 0)} PLN
                </span>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-haze-100 dark:hover:bg-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Remove ${product.title} from cart`}
              data-testid="remove-button"
            >
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          {/* Quantity Stepper and Line Total */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            {/* Quantity Stepper */}
            <div
              className="flex items-center"
              role="group"
              aria-label="Quantity controls"
            >
              <label htmlFor={`quantity-${item.itemId}`} className="sr-only">
                Quantity for {product.title}
              </label>
              <button
                onClick={handleDecrement}
                disabled={isDecrementDisabled}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-l-md bg-surface hover:bg-haze-100 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:z-10"
                aria-label="Decrease quantity"
                data-testid="decrement-button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>

              <input
                type="number"
                id={`quantity-${item.itemId}`}
                value={localQuantity}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                min={minQty}
                max={maxQty}
                disabled={isUpdating}
                className="w-16 h-8 text-center border-t border-b border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:z-10 disabled:opacity-50"
                aria-label={`Quantity: ${localQuantity}`}
                aria-valuemin={minQty}
                aria-valuemax={maxQty}
                aria-valuenow={localQuantity}
                data-testid="quantity-input"
              />

              <button
                onClick={handleIncrement}
                disabled={isIncrementDisabled}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-r-md bg-surface hover:bg-haze-100 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:z-10"
                aria-label="Increase quantity"
                data-testid="increment-button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Line Total and Savings */}
            <div className="text-right">
              {savings > 0 && (
                <p
                  className="text-xs text-green-600 dark:text-green-500 mb-1"
                  data-testid="savings"
                >
                  Save {formatPrice(savings)} PLN
                </p>
              )}
              <p
                className="text-lg font-bold text-navy-500 dark:text-white"
                aria-label={`Line total: ${formatPrice(lineTotal)} PLN`}
                data-testid="line-total"
              >
                {formatPrice(lineTotal)} PLN
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
