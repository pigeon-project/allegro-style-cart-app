import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SellerGroup } from "../components";
import type { CartItem as CartItemType, Product } from "../api-types";

// Mock cart data for demonstration
const mockProducts: Product[] = [
  {
    id: "prod-001",
    sellerId: "seller-123",
    sellerName: "Electronics Plus",
    title: "Logitech MX Master 3S Wireless Mouse - Graphite",
    imageUrl: "https://via.placeholder.com/200x200/4A4A4A/FFFFFF?text=Mouse",
    attributes: [{ Color: "Graphite" }, { Connectivity: "Bluetooth/USB" }],
    price: { amount: 34999, currency: "PLN" },
    listPrice: { amount: 44999, currency: "PLN" },
    currency: "PLN",
    availability: { inStock: true, maxOrderable: 50 },
    minQty: 1,
    maxQty: 10,
  },
  {
    id: "prod-002",
    sellerId: "seller-456",
    sellerName: "BookWorld",
    title:
      "The Pragmatic Programmer: Your Journey To Mastery, 20th Anniversary Edition",
    imageUrl: "https://via.placeholder.com/200x200/2E7D32/FFFFFF?text=Book",
    attributes: [{ Format: "Paperback" }, { Language: "English" }],
    price: { amount: 8900, currency: "PLN" },
    currency: "PLN",
    availability: { inStock: true, maxOrderable: 100 },
    minQty: 1,
    maxQty: 5,
  },
  {
    id: "prod-003",
    sellerId: "seller-123",
    sellerName: "Electronics Plus",
    title: "USB-C to USB-A Cable 2m - Black",
    imageUrl: "https://via.placeholder.com/200x200/1976D2/FFFFFF?text=Cable",
    attributes: [{ Length: "2m" }, { Color: "Black" }],
    price: { amount: 1999, currency: "PLN" },
    listPrice: { amount: 2999, currency: "PLN" },
    currency: "PLN",
    availability: { inStock: true, maxOrderable: 200 },
    minQty: 1,
    maxQty: 20,
  },
  {
    id: "prod-004",
    sellerId: "seller-789",
    sellerName: "Fashion Hub",
    title: "Tommy Hilfiger Classic Polo Shirt - Navy Blue",
    imageUrl: "https://via.placeholder.com/200x200/003366/FFFFFF?text=Shirt",
    attributes: [{ Size: "L" }, { Color: "Navy Blue" }],
    price: { amount: 24999, currency: "PLN" },
    currency: "PLN",
    availability: { inStock: true, maxOrderable: 25 },
    minQty: 1,
    maxQty: 5,
  },
];

const mockCartItems: CartItemType[] = [
  {
    itemId: "item-001",
    productId: "prod-001",
    quantity: 2,
    price: { amount: 34999, currency: "PLN" },
    listPrice: { amount: 44999, currency: "PLN" },
  },
  {
    itemId: "item-002",
    productId: "prod-002",
    quantity: 1,
    price: { amount: 8900, currency: "PLN" },
  },
  {
    itemId: "item-003",
    productId: "prod-003",
    quantity: 3,
    price: { amount: 1999, currency: "PLN" },
    listPrice: { amount: 2999, currency: "PLN" },
  },
  {
    itemId: "item-004",
    productId: "prod-004",
    quantity: 1,
    price: { amount: 24999, currency: "PLN" },
  },
];

function CartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  // Group items by sellerId
  const itemsBySeller = useMemo(() => {
    const groups = new Map<
      string,
      { seller: { id: string; name: string }; items: CartItemType[] }
    >();

    cartItems.forEach((item) => {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (!product) return;

      const sellerId = product.sellerId!;
      if (!groups.has(sellerId)) {
        groups.set(sellerId, {
          seller: { id: sellerId, name: product.sellerName! },
          items: [],
        });
      }
      groups.get(sellerId)!.items.push(item);
    });

    return groups;
  }, [cartItems]);

  // Create products map for efficient lookup
  const productsMap = useMemo(() => {
    const map = new Map<string, Product>();
    mockProducts.forEach((product) => {
      map.set(product.id!, product);
    });
    return map;
  }, []);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    // Simulate optimistic update
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    // Update local state immediately
    setCartItems((items) =>
      items.map((item) =>
        item.itemId === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );

    // Simulate API call delay
    setTimeout(() => {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }, 500);
  };

  const handleRemove = (itemId: string) => {
    // Simulate optimistic removal
    setRemovingItems((prev) => new Set(prev).add(itemId));

    // Simulate API call delay
    setTimeout(() => {
      setCartItems((items) => items.filter((item) => item.itemId !== itemId));
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }, 500);
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price?.amount || 0) * (item.quantity || 1),
    0,
  );
  const delivery = 0;
  const total = subtotal + delivery;

  const formatPrice = (amount: number) => (amount / 100).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Grid layout: cart items on left, summary on right (desktop), stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main cart content area - takes 2/3 on desktop */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-md p-6">
            <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-2">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-0">
                {Array.from(itemsBySeller.values()).map((group) => (
                  <SellerGroup
                    key={group.seller.id}
                    sellerId={group.seller.id}
                    sellerName={group.seller.name}
                    items={group.items}
                    products={productsMap}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    updatingItems={updatingItems}
                    removingItems={removingItems}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order summary panel - takes 1/3 on desktop */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Summary details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)} PLN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Delivery</span>
                <span className="font-medium">{formatPrice(delivery)} PLN</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg">
                    {formatPrice(total)} PLN
                  </span>
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
