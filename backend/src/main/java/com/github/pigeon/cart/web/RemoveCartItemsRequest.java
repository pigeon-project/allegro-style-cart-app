package com.github.pigeon.cart.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

@Schema(description = "Request to remove multiple cart items")
public record RemoveCartItemsRequest(
        @Schema(description = "List of item IDs to remove", required = true)
        @NotEmpty(message = "Item IDs list cannot be empty")
        List<UUID> itemIds
) {
}
