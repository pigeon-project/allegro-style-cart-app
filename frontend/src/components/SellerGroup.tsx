import { useEffect, useRef } from "react";
import CartItem from "./CartItem";
import type { CartItemResponse } from "../api-types";

export interface SellerGroupProps {
  sellerId: string;
  sellerName: string;
  items: CartItemResponse[];
  selectedItemIds?: Set<string>;
  onSelectionChange?: (itemId: string, selected: boolean) => void;
  onSellerSelectionChange?: (sellerId: string, selected: boolean) => void;
  onQuantityChange?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
}

export default function SellerGroup({
  sellerId,
  sellerName,
  items,
  selectedItemIds = new Set(),
  onSelectionChange,
  onSellerSelectionChange,
  onQuantityChange,
  onRemove,
}: SellerGroupProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Calculate selection state
  const selectedCount = items.filter((item) =>
    selectedItemIds.has(item.id || ""),
  ).length;
  const totalCount = items.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  // Update checkbox indeterminate state
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleSellerCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = e.target.checked;
    onSellerSelectionChange?.(sellerId, selected);

    // Also trigger individual item selection changes
    items.forEach((item) => {
      if (item.id) {
        onSelectionChange?.(item.id, selected);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-colors">
      {/* Seller Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 transition-colors">
        <div className="flex items-center gap-3">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSellerCheckboxChange}
            aria-label={`Select all items from ${sellerName}`}
            className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer touch-manipulation"
          />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {sellerName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {totalCount} {totalCount === 1 ? "item" : "items"}
              {selectedCount > 0 && (
                <span className="ml-2">• {selectedCount} selected</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {items.map((item) => (
          <div key={item.id} className="p-4">
            <CartItem
              item={item}
              isSelected={selectedItemIds.has(item.id || "")}
              onSelectionChange={onSelectionChange}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
