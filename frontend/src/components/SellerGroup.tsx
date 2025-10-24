/**
 * Seller Group Component
 *
 * Groups cart items by seller with:
 * - Collapsible section with header "Parcel from {seller}"
 * - Master checkbox UI (visual only, no backend support yet)
 * - Keyboard accessible collapse/expand
 * - Proper spacing and borders matching Allegro mockups
 */

import { useState } from "react";
import CartItem from "./CartItem";
import type { CartItem as CartItemType, Product } from "../api-types";

export interface SellerGroupProps {
  /** Seller ID for this group */
  sellerId: string;
  /** Seller name for display */
  sellerName: string;
  /** Cart items belonging to this seller */
  items: CartItemType[];
  /** Product details map for all items */
  products: Map<string, Product>;
  /** Callback when quantity changes */
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  /** Callback when item is removed */
  onRemove: (itemId: string) => void;
  /** Set of items being updated */
  updatingItems?: Set<string>;
  /** Set of items being removed */
  removingItems?: Set<string>;
  /** Whether the group starts collapsed (default: false) */
  defaultCollapsed?: boolean;
}

/**
 * SellerGroup Component
 *
 * A collapsible group of cart items from a single seller.
 * Implements WCAG 2.2 AA compliance with keyboard navigation and ARIA attributes.
 */
export default function SellerGroup({
  sellerId,
  sellerName,
  items,
  products,
  onQuantityChange,
  onRemove,
  updatingItems = new Set(),
  removingItems = new Set(),
  defaultCollapsed = false,
}: SellerGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Support keyboard navigation
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCollapsed();
    } else if (e.key === "ArrowRight" && isCollapsed) {
      e.preventDefault();
      setIsCollapsed(false);
    } else if (e.key === "ArrowLeft" && !isCollapsed) {
      e.preventDefault();
      setIsCollapsed(true);
    }
  };

  const itemCount = items.length;
  const groupId = `seller-group-${sellerId}`;
  const contentId = `${groupId}-content`;

  return (
    <div
      className="bg-surface border border-border rounded-md overflow-hidden mb-4"
      data-testid={`seller-group-${sellerId}`}
      role="region"
      aria-labelledby={groupId}
    >
      {/* Seller Group Header */}
      <div className="bg-haze-50 dark:bg-navy-800 border-b border-border">
        <button
          id={groupId}
          onClick={toggleCollapsed}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-haze-100 dark:hover:bg-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
          data-testid="seller-group-header"
        >
          {/* Collapse/Expand Icon */}
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform ${
              isCollapsed ? "-rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>

          {/* Master Checkbox (visual only for now) */}
          <div
            className="flex items-center justify-center w-5 h-5 border-2 border-border rounded bg-white dark:bg-navy-600"
            role="presentation"
            aria-hidden="true"
          >
            {/* Checkbox checkmark placeholder */}
          </div>

          {/* Seller Name */}
          <div className="flex-1 text-left">
            <h2 className="text-base font-semibold text-text">
              Parcel from {sellerName}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          {/* Seller ID badge (for debugging, can be removed) */}
          {process.env.NODE_ENV === "development" && (
            <span className="text-xs text-text-secondary bg-haze-100 dark:bg-navy-900 px-2 py-1 rounded">
              {sellerId}
            </span>
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div
          id={contentId}
          className="p-4 space-y-4"
          role="group"
          aria-label={`Items from ${sellerName}`}
        >
          {items.map((item) => {
            const product = products.get(item.productId!);
            if (!product) {
              console.warn(
                `Product not found for item ${item.itemId}: ${item.productId}`,
              );
              return null;
            }

            return (
              <CartItem
                key={item.itemId}
                item={item}
                product={product}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
                isUpdating={updatingItems.has(item.itemId!)}
                isRemoving={removingItems.has(item.itemId!)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
