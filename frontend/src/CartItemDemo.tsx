import { useState, useMemo } from "react";
import SellerGroup from "./components/SellerGroup";
import CartSummary from "./components/CartSummary";
import CartHeader from "./components/CartHeader";
import type { CartItemResponse } from "./api-types";
import { useDarkMode } from "./hooks/useDarkMode";

const mockItems: CartItemResponse[] = [
  {
    id: "item-1",
    cartId: "cart-123",
    sellerId: "seller-1",
    productImage: "https://picsum.photos/200/200?random=1",
    productTitle: "Wireless Mouse - Ergonomic Design with USB Receiver",
    pricePerUnit: 29.99,
    quantity: 1,
    totalPrice: 29.99,
  },
  {
    id: "item-2",
    cartId: "cart-123",
    sellerId: "seller-1",
    productImage: "https://picsum.photos/200/200?random=2",
    productTitle: "Mechanical Gaming Keyboard RGB Backlit",
    pricePerUnit: 89.99,
    quantity: 2,
    totalPrice: 179.98,
  },
  {
    id: "item-3",
    cartId: "cart-123",
    sellerId: "seller-2",
    productTitle: "USB-C Hub 7-in-1 Adapter (No Image)",
    pricePerUnit: 45.5,
    quantity: 3,
    totalPrice: 136.5,
  },
  {
    id: "item-4",
    cartId: "cart-123",
    sellerId: "seller-2",
    productImage: "https://picsum.photos/200/200?random=4",
    productTitle: "Wireless Headphones - Noise Cancelling",
    pricePerUnit: 129.99,
    quantity: 1,
    totalPrice: 129.99,
  },
  {
    id: "item-5",
    cartId: "cart-123",
    sellerId: "seller-3",
    productImage: "https://picsum.photos/200/200?random=5",
    productTitle: "Laptop Stand - Adjustable Aluminum",
    pricePerUnit: 49.99,
    quantity: 1,
    totalPrice: 49.99,
  },
];

// Mock seller names
const sellerNames: Record<string, string> = {
  "seller-1": "TechStore Electronics",
  "seller-2": "GadgetHub Pro",
  "seller-3": "OfficeMax Supplies",
};

export default function CartItemDemo() {
  const { isDark, toggle } = useDarkMode();
  const [items, setItems] = useState(mockItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Group items by seller
  const itemsBySeller = useMemo(() => {
    const grouped = new Map<string, CartItemResponse[]>();
    items.forEach((item) => {
      const sellerId = item.sellerId || "unknown";
      if (!grouped.has(sellerId)) {
        grouped.set(sellerId, []);
      }
      grouped.get(sellerId)!.push(item);
    });
    return grouped;
  }, [items]);

  const handleSelectionChange = (itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: (item.pricePerUnit ?? 0) * quantity,
            }
          : item,
      ),
    );
  };

  const handleRemove = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  // Calculate selection state for header
  const allSelected = items.length > 0 && selectedItems.size === items.length;
  const indeterminate = selectedItems.size > 0 && !allSelected;

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(new Set(items.map((item) => item.id!)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleRemoveSelected = () => {
    const selectedIds = Array.from(selectedItems);
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id!)));
    setSelectedItems(new Set());
  };

  const handleRemoveAll = () => {
    setItems([]);
    setSelectedItems(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Cart with Summary Panel Demo
            </h1>
            <button
              onClick={toggle}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Testing cart summary panel with price calculation and responsive
            layout
          </p>
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-indigo-900 dark:text-indigo-300">
              <strong>Selected items:</strong>{" "}
              {selectedItems.size > 0
                ? Array.from(selectedItems).join(", ")
                : "None"}
            </p>
          </div>
        </header>

        <main className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items - Left side (2/3 width) */}
          <div className="lg:col-span-2 space-y-6 mb-24 lg:mb-0">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p className="text-lg">All items removed!</p>
                <button
                  onClick={() => setItems(mockItems)}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Reset Items
                </button>
              </div>
            ) : (
              <>
                {/* Cart Header */}
                <CartHeader
                  totalItems={items.length}
                  selectedItems={selectedItems.size}
                  allSelected={allSelected}
                  indeterminate={indeterminate}
                  onSelectAll={handleSelectAll}
                  onRemoveSelected={handleRemoveSelected}
                  onRemoveAll={handleRemoveAll}
                />

                {/* Seller Groups */}
                {Array.from(itemsBySeller.entries()).map(
                  ([sellerId, sellerItems]) => (
                    <SellerGroup
                      key={sellerId}
                      sellerId={sellerId}
                      sellerName={sellerNames[sellerId] || `Seller ${sellerId}`}
                      items={sellerItems}
                      selectedItemIds={selectedItems}
                      onSelectionChange={handleSelectionChange}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  ),
                )}
              </>
            )}
          </div>

          {/* Cart Summary - Right side (1/3 width) */}
          <div className="lg:col-span-1">
            <CartSummary items={items} selectedItemIds={selectedItems} />
          </div>
        </main>

        <footer className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-lg mb-2">Features Demonstrated:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <strong>Cart header with "Select All" checkbox</strong>
            </li>
            <li>
              <strong>
                Cart header indeterminate state when some items selected
              </strong>
            </li>
            <li>
              <strong>
                "Remove" dropdown menu with "Remove selected" and "Remove all"
                options
              </strong>
            </li>
            <li>
              <strong>
                Confirmation dialogs for remove selected and remove all actions
              </strong>
            </li>
            <li>
              <strong>Keyboard navigation (Escape to close dropdown)</strong>
            </li>
            <li>Cart items grouped by seller</li>
            <li>
              Seller-level checkbox to select/deselect all items from seller
            </li>
            <li>Indeterminate state when some items selected from a seller</li>
            <li>Seller name and item count display</li>
            <li>Product image display (with fallback placeholder)</li>
            <li>Product title with truncation</li>
            <li>Individual item selection checkbox</li>
            <li>Quantity selector (1-99 range, disabled at limits)</li>
            <li>Price per unit (smaller font when quantity &gt; 1)</li>
            <li>Total price display (shown when quantity &gt; 1)</li>
            <li>Remove button with confirmation dialog</li>
            <li>
              <strong>
                Cart summary panel with total price of selected items
              </strong>
            </li>
            <li>
              <strong>Price formatted in PLN (e.g., 123,45 zł)</strong>
            </li>
            <li>
              <strong>
                Dynamic price updates on selection/quantity changes
              </strong>
            </li>
            <li>
              <strong>
                Sticky positioning on desktop, fixed at bottom on mobile
              </strong>
            </li>
            <li>Touch-friendly buttons (44px minimum touch target)</li>
            <li>Responsive layout (mobile/tablet/desktop)</li>
            <li>Dark mode support</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
