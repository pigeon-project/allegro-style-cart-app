package com.github.pigeon.cart.web;

import jakarta.validation.constraints.Positive;

/**
 * Request to update an item's quantity in the cart.
 * Complies with API specification: body contains only quantity.
 * 
 * @param quantity New quantity for the item
 */
record UpdateItemRequest(
        @Positive(message = "Quantity must be positive")
        int quantity
) {
    
    UpdateItemRequest {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
    }
}
