package com.github.pigeon.cart.web;

/**
 * Request to update an item's quantity in the cart.
 * Complies with API specification: body contains only quantity.
 * 
 * @param quantity New quantity for the item
 */
record UpdateItemRequest(
        int quantity
) {
    
    UpdateItemRequest {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
    }
}
