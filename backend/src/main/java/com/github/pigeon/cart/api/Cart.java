package com.github.pigeon.cart.api;

import java.util.UUID;

public record Cart(
        UUID id,
        String userId
) {
    public Cart {
        if (id == null) {
            throw new IllegalArgumentException("Cart ID cannot be null");
        }
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be blank");
        }
    }
}
