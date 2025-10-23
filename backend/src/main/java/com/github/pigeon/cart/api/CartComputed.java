package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;

/**
 * Represents computed totals for a cart.
 * 
 * @param subtotal Total cost of all items (sum of line totals)
 * @param delivery Delivery cost
 * @param total    Grand total (subtotal + delivery)
 */
public record CartComputed(
        Money subtotal,
        Money delivery,
        Money total
) {
    
    public CartComputed {
        if (subtotal == null) {
            throw new IllegalArgumentException("Subtotal cannot be null");
        }
        if (delivery == null) {
            throw new IllegalArgumentException("Delivery cannot be null");
        }
        if (total == null) {
            throw new IllegalArgumentException("Total cannot be null");
        }
    }
}
