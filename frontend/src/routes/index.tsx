import { createFileRoute } from "@tanstack/react-router";

function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Grid layout: cart items on left, summary on right (desktop), stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main cart content area - takes 2/3 on desktop */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-md p-6">
            <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>

            {/* Placeholder for cart items - will be implemented in future */}
            <div className="text-center py-12 text-text-secondary">
              <p className="text-lg">Cart items will be displayed here</p>
              <p className="text-sm mt-2">
                This is a placeholder for the cart layout
              </p>
            </div>
          </div>
        </div>

        {/* Order summary panel - takes 1/3 on desktop */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Placeholder for summary details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium">0.00 PLN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Delivery</span>
                <span className="font-medium">0.00 PLN</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg">0.00 PLN</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary-hover transition-colors">
                Delivery and Payment
              </button>
              <button className="w-full border border-border bg-surface text-text py-3 px-4 rounded-md font-medium hover:bg-haze-100 dark:hover:bg-navy-700 transition-colors">
                Continue Shopping
              </button>
            </div>

            {/* Coupon hint area */}
            <div className="mt-6 p-3 bg-haze-50 dark:bg-navy-800 rounded-md">
              <p className="text-sm text-text-secondary">
                Have a coupon? You can add it during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: CartPage,
});
