package com.github.pigeon.cart.web;

import com.github.pigeon.cart.api.CartItem;

import java.util.List;

/**
 * Request to remove an item from the cart.
 * Contains the current cart state (item will be removed by itemId from path parameter).
 * 
 * @param currentItems Current items in the cart (must include the item being removed)
 */
record RemoveItemRequest(
        List<CartItem> currentItems
) {
    
    RemoveItemRequest {
        if (currentItems == null) {
            throw new IllegalArgumentException("Current items cannot be null");
        }
    }
}
