package com.github.pigeon.cart.api;

import java.util.List;

/**
 * Represents a snapshot of a shopping cart with all items and computed totals.
 * 
 * @param cartId   Unique identifier for the cart
 * @param items    List of items in the cart
 * @param computed Computed totals (subtotal, delivery, total)
 */
public record CartSnapshot(
        String cartId,
        List<CartItem> items,
        CartComputed computed
) {
    
    public CartSnapshot {
        if (cartId == null || cartId.isBlank()) {
            throw new IllegalArgumentException("Cart id cannot be null or blank");
        }
        if (items == null) {
            throw new IllegalArgumentException("Items cannot be null");
        }
        if (computed == null) {
            throw new IllegalArgumentException("Computed totals cannot be null");
        }
    }
}
