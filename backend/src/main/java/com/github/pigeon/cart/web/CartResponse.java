package com.github.pigeon.cart.web;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Cart response with all items grouped by seller")
public record CartResponse(
        @Schema(description = "Cart ID", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID cartId,

        @Schema(description = "User ID", example = "admin")
        String userId,

        @Schema(description = "List of cart items")
        List<CartItemResponse> items
) {
}
