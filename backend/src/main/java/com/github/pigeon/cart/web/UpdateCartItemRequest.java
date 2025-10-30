package com.github.pigeon.cart.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request to update cart item quantity")
public record UpdateCartItemRequest(
        @Schema(description = "New quantity", example = "5", required = true, minimum = "1", maximum = "99")
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 99, message = "Quantity must not exceed 99")
        Integer quantity
) {
}
