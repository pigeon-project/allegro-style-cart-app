package com.github.pigeon.cart.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * Request to add an item to the cart.
 * Complies with API specification: body contains only productId and quantity.
 * 
 * @param productId Product identifier to add
 * @param quantity  Quantity to add
 */
record AddItemRequest(
        @NotBlank(message = "Product ID cannot be blank")
        String productId,
        
        @Positive(message = "Quantity must be positive")
        int quantity
) {
    
    AddItemRequest {
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("Product id cannot be null or blank");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
    }
}
