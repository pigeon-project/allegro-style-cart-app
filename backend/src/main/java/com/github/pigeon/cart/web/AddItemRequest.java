package com.github.pigeon.cart.web;

import com.github.pigeon.cart.api.QuoteRequest;

import java.util.List;

/**
 * Request to add an item to the cart.
 * Contains the item to add and the current cart state.
 * 
 * @param productId    Product identifier to add
 * @param quantity     Quantity to add
 * @param currentItems Current items in the cart (optional, can be empty)
 */
record AddItemRequest(
        String productId,
        int quantity,
        List<QuoteRequest.QuoteItem> currentItems
) {
    
    AddItemRequest {
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("Product id cannot be null or blank");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (currentItems == null) {
            currentItems = List.of();
        }
    }
}
