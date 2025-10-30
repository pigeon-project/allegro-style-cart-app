export interface EmptyCartProps {
  onStartShopping?: () => void;
}

/**
 * EmptyCart component displays an empty state when the shopping cart has no items.
 *
 * Purpose: Provides a visually appealing empty state with an illustration and encouraging
 * message to guide users to start shopping.
 *
 * Key Features:
 * - Empty cart SVG illustration display
 * - Appropriate empty state message in English
 * - Optional "Start Shopping" call-to-action button
 * - Centered layout with proper spacing
 * - Responsive layout for mobile, tablet, desktop
 * - Dark mode support with proper illustration visibility
 * - Professional Tailwind styling matching Allegro design
 */
export default function EmptyCart({ onStartShopping }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
      {/* Empty Cart Illustration */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-8">
        <img
          src="/empty-cart-image.svg"
          alt="Empty shopping cart"
          className="w-full h-auto"
        />
      </div>

      {/* Empty State Message */}
      <div className="text-center max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Your cart is empty
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8">
          Start adding items to your cart and they will appear here.
        </p>

        {/* Optional Call-to-Action Button */}
        {onStartShopping && (
          <button
            onClick={onStartShopping}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] min-w-[44px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/25 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            aria-label="Start shopping"
          >
            Start Shopping
          </button>
        )}
      </div>
    </div>
  );
}
