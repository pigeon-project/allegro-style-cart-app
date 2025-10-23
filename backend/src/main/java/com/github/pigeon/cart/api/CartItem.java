package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;

/**
 * Represents an item in the shopping cart.
 * 
 * @param itemId    Unique identifier for the cart item
 * @param productId Identifier of the product
 * @param quantity  Quantity of the item in the cart
 * @param price     Effective price per unit
 * @param listPrice Original list price per unit (for calculating savings)
 */
public record CartItem(
        String itemId,
        String productId,
        int quantity,
        Money price,
        Money listPrice
) {
    
    public CartItem {
        if (itemId == null || itemId.isBlank()) {
            throw new IllegalArgumentException("Item id cannot be null or blank");
        }
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("Product id cannot be null or blank");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (price == null) {
            throw new IllegalArgumentException("Price cannot be null");
        }
    }
}
