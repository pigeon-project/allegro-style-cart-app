package com.github.pigeon.cart.web;

import com.github.pigeon.common.Allowlist;
import com.github.pigeon.common.TextUtils;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "Request to add an item to the cart")
public record AddCartItemRequest(
        @Schema(description = "Seller ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
        @NotNull(message = "Seller ID is required")
        UUID sellerId,

        @Schema(description = "Product image URL", example = "https://example.com/product.jpg")
        @Allowlist(pattern = TextUtils.PRODUCT_TEXT_PATTERN, message = "Product image URL contains invalid characters")
        String productImage,

        @Schema(description = "Product title", example = "Wireless Mouse", required = true)
        @NotBlank(message = "Product title is required")
        @Length(max = 500, message = "Product title must not exceed 500 characters")
        @Allowlist(pattern = TextUtils.PRODUCT_TEXT_PATTERN, message = "Product title contains invalid characters")
        String productTitle,

        @Schema(description = "Price per unit", example = "29.99", required = true)
        @NotNull(message = "Price per unit is required")
        BigDecimal pricePerUnit,

        @Schema(description = "Quantity", example = "2", required = true, minimum = "1", maximum = "99")
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 99, message = "Quantity must not exceed 99")
        Integer quantity
) {
}
