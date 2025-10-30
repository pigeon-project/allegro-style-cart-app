import { useMemo } from "react";
import type { CartItemResponse } from "../api-types";

export interface CartSummaryProps {
  items: CartItemResponse[];
  selectedItemIds: Set<string>;
}

/**
 * CartSummary component displays the total price of selected cart items
 * Features:
 * - Shows total price of selected items only
 * - Formats prices in PLN (e.g., 123,45 zł)
 * - Updates dynamically when items are selected/deselected or quantities change
 * - Sticky positioning on desktop, fixed at bottom on mobile
 * - Dark mode support
 */
export default function CartSummary({
  items,
  selectedItemIds,
}: CartSummaryProps) {
  // Calculate total price of selected items
  const { totalPrice, selectedCount } = useMemo(() => {
    let total = 0;
    let count = 0;

    items.forEach((item) => {
      if (item.id && selectedItemIds.has(item.id)) {
        // Use totalPrice if available, otherwise calculate from pricePerUnit * quantity
        const itemTotal =
          item.totalPrice ?? (item.pricePerUnit ?? 0) * (item.quantity ?? 1);
        total += itemTotal;
        count++;
      }
    });

    return {
      totalPrice: total,
      selectedCount: count,
    };
  }, [items, selectedItemIds]);

  // Format price in PLN
  const formatPrice = (amount: number): string => {
    return `${amount.toFixed(2).replace(".", ",")} zł`;
  };

  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Selected items:</span>
                <span className="font-medium">{selectedCount}</span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={selectedCount === 0}
              className="w-full mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              aria-label={
                selectedCount === 0
                  ? "Select items to checkout"
                  : "Proceed to checkout"
              }
            >
              {selectedCount === 0 ? "Select items" : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet: Fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg transition-colors">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCount} {selectedCount === 1 ? "item" : "items"}{" "}
                selected
              </p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <button
              disabled={selectedCount === 0}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 min-h-[44px]"
              aria-label={
                selectedCount === 0
                  ? "Select items to checkout"
                  : "Proceed to checkout"
              }
            >
              {selectedCount === 0 ? "Select items" : "Checkout"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
