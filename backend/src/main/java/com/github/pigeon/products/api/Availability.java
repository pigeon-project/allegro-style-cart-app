package com.github.pigeon.products.api;

/**
 * Represents product availability information.
 */
public record Availability(boolean inStock, int maxOrderable) {
    
    public Availability {
        if (maxOrderable < 0) {
            throw new IllegalArgumentException("Max orderable quantity cannot be negative");
        }
    }
}
