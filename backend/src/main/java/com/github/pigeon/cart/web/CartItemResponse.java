package com.github.pigeon.cart.web;

import com.github.pigeon.cart.api.CartItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "Cart item response")
public record CartItemResponse(
        @Schema(description = "Item ID", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID id,

        @Schema(description = "Cart ID", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID cartId,

        @Schema(description = "Seller ID", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID sellerId,

        @Schema(description = "Product image URL", example = "https://example.com/product.jpg")
        String productImage,

        @Schema(description = "Product title", example = "Wireless Mouse")
        String productTitle,

        @Schema(description = "Price per unit", example = "29.99")
        BigDecimal pricePerUnit,

        @Schema(description = "Quantity", example = "2")
        int quantity,

        @Schema(description = "Total price (price per unit * quantity)", example = "59.98")
        BigDecimal totalPrice
) {
    public static CartItemResponse from(CartItem item) {
        return new CartItemResponse(
                item.id(),
                item.cartId(),
                item.sellerId(),
                item.productImage(),
                item.productTitle(),
                item.pricePerUnit(),
                item.quantity(),
                item.totalPrice()
        );
    }
}
