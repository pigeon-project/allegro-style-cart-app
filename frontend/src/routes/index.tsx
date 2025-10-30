import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { useState, useMemo } from "react";
import {
  useCart,
  useRemoveCartItems,
  useUpdateCartItemQuantity,
  useRemoveCartItem,
} from "../lib/cart-api";
import CartHeader from "../components/CartHeader";
import SellerGroup from "../components/SellerGroup";
import CartSummary from "../components/CartSummary";
import EmptyCart from "../components/EmptyCart";
import RecommendedProducts from "../components/RecommendedProducts";
import type { CartItemResponse } from "../api-types";

function CartPage() {
  const { data: cartData, isLoading, isError, error } = useCart();
  const removeCartItemsMutation = useRemoveCartItems();
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveCartItem();

  // Local selection state
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );

  const items = useMemo(
    () => cartData?.data?.items || [],
    [cartData?.data?.items],
  );
  const etag = cartData?.etag;

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

  // Calculate selection states
  const allSelected = items.length > 0 && selectedItemIds.size === items.length;
  const indeterminate =
    selectedItemIds.size > 0 && selectedItemIds.size < items.length;

  // Handlers
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItemIds(new Set(items.map((item) => item.id || "")));
    } else {
      setSelectedItemIds(new Set());
    }
  };

  const handleSelectionChange = (itemId: string, selected: boolean) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSellerSelectionChange = (sellerId: string, selected: boolean) => {
    const sellerItems = itemsBySeller.get(sellerId) || [];
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      sellerItems.forEach((item) => {
        if (selected) {
          newSet.add(item.id || "");
        } else {
          newSet.delete(item.id || "");
        }
      });
      return newSet;
    });
  };

  const handleRemoveSelected = () => {
    const itemIds = Array.from(selectedItemIds);
    removeCartItemsMutation.mutate(
      { itemIds },
      {
        onSuccess: () => {
          setSelectedItemIds(new Set());
        },
      },
    );
  };

  const handleRemoveAll = () => {
    removeCartItemsMutation.mutate(
      { removeAll: true },
      {
        onSuccess: () => {
          setSelectedItemIds(new Set());
        },
      },
    );
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateQuantityMutation.mutate({
      itemId,
      quantity,
      etag: etag || undefined,
    });
  };

  const handleRemove = (itemId: string) => {
    removeItemMutation.mutate(itemId, {
      onSuccess: () => {
        setSelectedItemIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Loading your cart...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Failed to load cart
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error instanceof Error
                ? error.message
                : "An error occurred while loading your cart"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <EmptyCart />
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Recommended for you
          </h2>
          <RecommendedProducts />
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main cart content */}
        <div className="flex-1">
          {/* Cart header */}
          <CartHeader
            totalItems={items.length}
            selectedItems={selectedItemIds.size}
            allSelected={allSelected}
            indeterminate={indeterminate}
            onSelectAll={handleSelectAll}
            onRemoveSelected={handleRemoveSelected}
            onRemoveAll={handleRemoveAll}
          />

          {/* Seller groups */}
          <div className="space-y-6 mt-6">
            {Array.from(itemsBySeller.entries()).map(
              ([sellerId, sellerItems]) => {
                // Generate a display name from sellerId
                const sellerName = `Seller ${sellerId.substring(0, 8)}...`;

                return (
                  <SellerGroup
                    key={sellerId}
                    sellerId={sellerId}
                    sellerName={sellerName}
                    items={sellerItems}
                    selectedItemIds={selectedItemIds}
                    onSelectionChange={handleSelectionChange}
                    onSellerSelectionChange={handleSellerSelectionChange}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                );
              },
            )}
          </div>

          {/* Recommended products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Recommended for you
            </h2>
            <RecommendedProducts />
          </div>
        </div>

        {/* Cart summary - desktop: sticky sidebar, mobile: fixed bottom */}
        <div className="lg:w-80">
          <CartSummary items={items} selectedItemIds={selectedItemIds} />
        </div>
      </div>

      {/* Loading overlay for mutations */}
      {(removeCartItemsMutation.isPending ||
        updateQuantityMutation.isPending ||
        removeItemMutation.isPending) && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CartPage,
});
