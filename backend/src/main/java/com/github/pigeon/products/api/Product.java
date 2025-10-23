package com.github.pigeon.products.api;

import java.util.List;
import java.util.Map;

/**
 * Represents a product in the system.
 */
public record Product(
        String id,
        String sellerId,
        String sellerName,
        String title,
        String imageUrl,
        List<Map<String, String>> attributes,
        Money price,
        Money listPrice,
        String currency,
        Availability availability,
        Integer minQty,
        Integer maxQty
) {
    
    public Product {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Product id cannot be null or blank");
        }
        if (sellerId == null || sellerId.isBlank()) {
            throw new IllegalArgumentException("Seller id cannot be null or blank");
        }
        if (sellerName == null || sellerName.isBlank()) {
            throw new IllegalArgumentException("Seller name cannot be null or blank");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be null or blank");
        }
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("Image URL cannot be null or blank");
        }
        if (price == null) {
            throw new IllegalArgumentException("Price cannot be null");
        }
        if (currency == null || !currency.equals("PLN")) {
            throw new IllegalArgumentException("Currency must be PLN");
        }
        if (availability == null) {
            throw new IllegalArgumentException("Availability cannot be null");
        }
        if (minQty != null && minQty <= 0) {
            throw new IllegalArgumentException("Min quantity must be positive");
        }
        if (maxQty != null && maxQty <= 0) {
            throw new IllegalArgumentException("Max quantity must be positive");
        }
        if (minQty != null && maxQty != null && minQty > maxQty) {
            throw new IllegalArgumentException("Min quantity cannot be greater than max quantity");
        }
    }
}
