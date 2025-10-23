package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Availability;

/**
 * Utility class for validating and adjusting cart item quantities.
 * Applies business rules for quantity constraints.
 */
public final class QuantityValidator {
    
    private QuantityValidator() {
        // Utility class
    }
    
    /**
     * Validates and clips the requested quantity to allowed bounds.
     * The quantity is clipped to [minQty, min(maxQty, availability.maxOrderable)].
     * 
     * @param requestedQuantity The requested quantity
     * @param minQty            Minimum allowed quantity (defaults to 1 if null)
     * @param maxQty            Maximum allowed quantity (defaults to 99 if null)
     * @param availability      Product availability information
     * @return The validated and clipped quantity
     */
    public static int validateAndClip(int requestedQuantity, Integer minQty, Integer maxQty, Availability availability) {
        if (availability == null) {
            throw new IllegalArgumentException("Availability cannot be null");
        }
        
        int effectiveMinQty = minQty != null ? minQty : 1;
        int effectiveMaxQty = maxQty != null ? maxQty : 99;
        
        // The upper bound is the minimum of maxQty and availability.maxOrderable
        int upperBound = Math.min(effectiveMaxQty, availability.maxOrderable());
        
        // Clip the requested quantity to the valid range
        // If upperBound < effectiveMinQty, we clip to upperBound (can't exceed availability)
        int clippedQuantity = Math.min(Math.max(effectiveMinQty, requestedQuantity), upperBound);
        
        return clippedQuantity;
    }
    
    /**
     * Checks if a quantity is valid within the constraints.
     * 
     * @param quantity     The quantity to check
     * @param minQty       Minimum allowed quantity (defaults to 1 if null)
     * @param maxQty       Maximum allowed quantity (defaults to 99 if null)
     * @param availability Product availability information
     * @return true if the quantity is valid, false otherwise
     */
    public static boolean isValid(int quantity, Integer minQty, Integer maxQty, Availability availability) {
        if (availability == null) {
            throw new IllegalArgumentException("Availability cannot be null");
        }
        
        int effectiveMinQty = minQty != null ? minQty : 1;
        int effectiveMaxQty = maxQty != null ? maxQty : 99;
        int upperBound = Math.min(effectiveMaxQty, availability.maxOrderable());
        
        return quantity >= effectiveMinQty && quantity <= upperBound;
    }
}
