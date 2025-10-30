import { useState } from "react";
import CartItem from "./components/CartItem";
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
];

export default function CartItemDemo() {
  const { isDark, toggle } = useDarkMode();
  const [items, setItems] = useState(mockItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              CartItem Component Demo
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
            Testing all features: selection, quantity controls, price display,
            removal, and responsive layout
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

        <main className="space-y-4">
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
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id ?? "")}
                onSelectionChange={handleSelectionChange}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))
          )}
        </main>

        <footer className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-lg mb-2">Features Demonstrated:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>Product image display (with fallback placeholder)</li>
            <li>Product title with truncation</li>
            <li>Selection checkbox</li>
            <li>Quantity selector (1-99 range, disabled at limits)</li>
            <li>Price per unit (smaller font when quantity &gt; 1)</li>
            <li>Total price display (shown when quantity &gt; 1)</li>
            <li>Remove button with confirmation dialog</li>
            <li>Touch-friendly buttons (44px minimum touch target)</li>
            <li>Responsive layout (mobile/tablet/desktop)</li>
            <li>Dark mode support</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
