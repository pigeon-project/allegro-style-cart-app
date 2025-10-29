package com.github.pigeon.cart.api;

import java.util.UUID;

public record Seller(
        UUID id,
        String name
) {
    public Seller {
        if (id == null) {
            throw new IllegalArgumentException("Seller ID cannot be null");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Seller name cannot be blank");
        }
    }
}
