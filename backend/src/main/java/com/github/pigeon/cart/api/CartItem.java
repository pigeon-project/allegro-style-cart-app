package com.github.pigeon.cart.api;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItem(
        UUID id,
        UUID cartId,
        UUID sellerId,
        String productImage,
        String productTitle,
        BigDecimal pricePerUnit,
        int quantity
) {
    public CartItem {
        if (productTitle == null || productTitle.isBlank()) {
            throw new IllegalArgumentException("Product title cannot be blank");
        }
        if (pricePerUnit == null || pricePerUnit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
        if (quantity < 1 || quantity > 99) {
            throw new IllegalArgumentException("Quantity must be between 1 and 99");
        }
    }

    public BigDecimal totalPrice() {
        return pricePerUnit.multiply(BigDecimal.valueOf(quantity));
    }
}
