package com.github.pigeon.cart.web;

import com.github.pigeon.cart.api.CartItem;

import java.util.List;

/**
 * Request to update an item's quantity in the cart.
 * Contains the new quantity and the current cart state.
 * 
 * @param quantity     New quantity for the item
 * @param currentItems Current items in the cart (must include the item being updated)
 */
record UpdateItemRequest(
        int quantity,
        List<CartItem> currentItems
) {
    
    UpdateItemRequest {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (currentItems == null) {
            throw new IllegalArgumentException("Current items cannot be null");
        }
    }
}
