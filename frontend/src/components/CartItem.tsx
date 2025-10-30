import { useState } from "react";
import type { CartItemResponse } from "../api-types";

export interface CartItemProps {
  item: CartItemResponse;
  isSelected?: boolean;
  onSelectionChange?: (itemId: string, selected: boolean) => void;
  onQuantityChange?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
}

export default function CartItem({
  item,
  isSelected = false,
  onSelectionChange,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isChangingQuantity, setIsChangingQuantity] = useState(false);

  const quantity = item.quantity || 1;
  const pricePerUnit = item.pricePerUnit || 0;
  const totalPrice = item.totalPrice || pricePerUnit * quantity;
  const showTotalPrice = quantity > 1;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    setIsChangingQuantity(true);
    onQuantityChange?.(item.id || "", newQuantity);
    // Reset the changing state after a brief delay to allow for visual feedback
    setTimeout(() => setIsChangingQuantity(false), 300);
  };

  const handleIncrement = () => {
    handleQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    handleQuantityChange(quantity - 1);
  };

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true);
  };

  const handleRemoveConfirm = () => {
    onRemove?.(item.id || "");
    setShowRemoveConfirm(false);
  };

  const handleRemoveCancel = () => {
    setShowRemoveConfirm(false);
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange?.(item.id || "", e.target.checked);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
      <div className="flex gap-4">
        {/* Checkbox for selection */}
        <div className="flex items-start pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            aria-label={`Select ${item.productTitle}`}
            className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 cursor-pointer touch-manipulation"
          />
        </div>

        {/* Product Image */}
        <div className="flex-shrink-0">
          {item.productImage ? (
            <img
              src={item.productImage}
              alt={item.productTitle || "Product"}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-600">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 truncate">
                {item.productTitle}
              </h3>

              {/* Price per unit - smaller when quantity > 1 */}
              <div className="mt-1">
                <span
                  className={`${
                    showTotalPrice
                      ? "text-xs text-slate-500 dark:text-slate-400"
                      : "text-base font-semibold text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {pricePerUnit.toFixed(2)} PLN
                  {showTotalPrice && " / item"}
                </span>
              </div>

              {/* Total price - shown only when quantity > 1 */}
              {showTotalPrice && (
                <div className="mt-1">
                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {totalPrice.toFixed(2)} PLN
                  </span>
                </div>
              )}
            </div>

            {/* Remove button - desktop */}
            <div className="hidden sm:block">
              <button
                onClick={handleRemoveClick}
                aria-label={`Remove ${item.productTitle}`}
                className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors touch-manipulation"
              >
                <svg
                  className="w-5 h-5"
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
          </div>

          {/* Quantity Selector and Mobile Remove */}
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isChangingQuantity}
                  aria-label="Decrease quantity"
                  className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                <span
                  className="px-4 py-2 min-w-[3rem] text-center text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900"
                  aria-label={`Quantity: ${quantity}`}
                >
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= 99 || isChangingQuantity}
                  aria-label="Increase quantity"
                  className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
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
            </div>

            {/* Remove button - mobile */}
            <button
              onClick={handleRemoveClick}
              aria-label={`Remove ${item.productTitle}`}
              className="sm:hidden p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors touch-manipulation"
            >
              <svg
                className="w-5 h-5"
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
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full"
            role="dialog"
            aria-labelledby="remove-dialog-title"
            aria-describedby="remove-dialog-description"
          >
            <h3
              id="remove-dialog-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
            >
              Remove Item
            </h3>
            <p
              id="remove-dialog-description"
              className="text-sm text-slate-600 dark:text-slate-400 mb-4"
            >
              Are you sure you want to remove "{item.productTitle}" from your
              cart?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleRemoveCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors touch-manipulation min-h-[44px]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
