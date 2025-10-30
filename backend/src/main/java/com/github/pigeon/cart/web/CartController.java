package com.github.pigeon.cart.web;

import com.github.pigeon.cart.CartCommands;
import com.github.pigeon.cart.CartQueries;
import com.github.pigeon.cart.api.Cart;
import com.github.pigeon.cart.api.CartItem;
import com.github.pigeon.common.PreconditionFailedException;
import com.github.pigeon.common.ResourceNotFoundException;
import com.github.pigeon.common.TextUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Shopping cart operations")
@SecurityRequirement(name = "basicAuth")
class CartController {

    private final CartQueries cartQueries;
    private final CartCommands cartCommands;

    CartController(CartQueries cartQueries, CartCommands cartCommands) {
        this.cartQueries = cartQueries;
        this.cartCommands = cartCommands;
    }

    @Operation(
            summary = "Get cart",
            description = "Retrieves the current user's shopping cart with all items. Returns ETag for concurrency control."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Cart retrieved successfully",
                    headers = @Header(name = "ETag", description = "Entity tag for concurrency control", schema = @Schema(type = "string"))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Cart not found", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @GetMapping
    ResponseEntity<CartResponse> getCart(Authentication authentication) {
        String userId = authentication.getName();

        Optional<Cart> cartOpt = cartQueries.getCartByUserId(userId);
        if (cartOpt.isEmpty()) {
            // Auto-create cart if it doesn't exist
            UUID cartId = cartCommands.createCart(userId);
            Cart cart = cartQueries.getCartByUserId(userId).orElseThrow();
            List<CartItemResponse> items = List.of();
            CartResponse response = new CartResponse(cart.id(), cart.userId(), items);
            String etag = generateETag(cart.id(), items);
            return ResponseEntity.ok()
                    .eTag(etag)
                    .body(response);
        }

        Cart cart = cartOpt.get();
        List<CartItem> items = cartQueries.getCartItems(cart.id());
        List<CartItemResponse> itemResponses = items.stream()
                .map(CartItemResponse::from)
                .toList();

        CartResponse response = new CartResponse(cart.id(), cart.userId(), itemResponses);
        String etag = generateETag(cart.id(), itemResponses);

        return ResponseEntity.ok()
                .eTag(etag)
                .body(response);
    }

    @Operation(
            summary = "Add item to cart",
            description = "Adds a new item to the shopping cart"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Item added successfully",
                    headers = @Header(name = "Location", description = "URI of the created item", schema = @Schema(type = "string"))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "422", description = "Domain validation error", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PostMapping("/items")
    ResponseEntity<Void> addItem(
            @Valid @RequestBody AddCartItemRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        // Get or create cart
        Cart cart = cartQueries.getCartByUserId(userId)
                .orElseGet(() -> {
                    UUID cartId = cartCommands.createCart(userId);
                    return cartQueries.getCartByUserId(userId).orElseThrow();
                });

        // Normalize text inputs before processing (SHARED-NFR Section 10)
        String normalizedTitle = TextUtils.normalizeText(request.productTitle());
        String normalizedImage = request.productImage() != null ? 
                TextUtils.normalizeText(request.productImage()) : null;

        UUID itemId = cartCommands.addCartItem(
                cart.id(),
                request.sellerId(),
                normalizedImage,
                normalizedTitle,
                request.pricePerUnit(),
                request.quantity()
        );

        return ResponseEntity.created(URI.create("/api/cart/items/" + itemId)).build();
    }

    @Operation(
            summary = "Update item quantity",
            description = "Updates the quantity of a specific cart item. Requires If-Match header with ETag for concurrency control."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Item updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Item not found", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "412", description = "Precondition failed - ETag mismatch", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "422", description = "Domain validation error", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @PutMapping("/items/{id}")
    ResponseEntity<Void> updateItemQuantity(
            @Parameter(description = "Item ID", required = true) @PathVariable UUID id,
            @Valid @RequestBody UpdateCartItemRequest request,
            @Parameter(description = "ETag for concurrency control", required = true) @RequestHeader(value = "If-Match", required = false) String ifMatch,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        // Verify item exists and belongs to user's cart
        CartItem item = cartQueries.getCartItem(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + id));

        Cart cart = cartQueries.getCartByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        if (!item.cartId().equals(cart.id())) {
            throw new ResourceNotFoundException("Cart item not found: " + id);
        }

        // Verify ETag if provided
        if (ifMatch != null) {
            List<CartItem> items = cartQueries.getCartItems(cart.id());
            List<CartItemResponse> itemResponses = items.stream()
                    .map(CartItemResponse::from)
                    .toList();
            String currentETag = generateETag(cart.id(), itemResponses);
            String providedETag = ifMatch.replaceAll("\"", "");

            if (!currentETag.equals(providedETag)) {
                throw new PreconditionFailedException("ETag mismatch - cart has been modified");
            }
        }

        cartCommands.updateQuantity(id, request.quantity());

        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Remove single item",
            description = "Removes a specific item from the cart"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Item removed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Item not found", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @DeleteMapping("/items/{id}")
    ResponseEntity<Void> removeItem(
            @Parameter(description = "Item ID", required = true) @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        // Verify item exists and belongs to user's cart
        CartItem item = cartQueries.getCartItem(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + id));

        Cart cart = cartQueries.getCartByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        if (!item.cartId().equals(cart.id())) {
            throw new ResourceNotFoundException("Cart item not found: " + id);
        }

        cartCommands.removeItem(id);

        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Remove multiple items",
            description = "Removes selected items from the cart or all items if no specific items are provided"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Items removed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Cart not found", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @DeleteMapping("/items")
    ResponseEntity<Void> removeItems(
            @Parameter(description = "Request with item IDs to remove, or empty to remove all")
            @RequestBody(required = false) RemoveCartItemsRequest request,
            @Parameter(description = "Remove all items flag") @RequestParam(value = "all", required = false, defaultValue = "false") boolean removeAll,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        Cart cart = cartQueries.getCartByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        if (removeAll || request == null || request.itemIds().isEmpty()) {
            // Remove all items
            cartCommands.removeAllItems(cart.id());
        } else {
            // Verify all items belong to user's cart
            for (UUID itemId : request.itemIds()) {
                CartItem item = cartQueries.getCartItem(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

                if (!item.cartId().equals(cart.id())) {
                    throw new ResourceNotFoundException("Cart item not found: " + itemId);
                }
            }

            // Remove selected items
            cartCommands.removeItems(request.itemIds());
        }

        return ResponseEntity.noContent().build();
    }

    private String generateETag(UUID cartId, List<CartItemResponse> items) {
        // Generate ETag based on cart ID and items hash
        int hash = cartId.hashCode();
        for (CartItemResponse item : items) {
            hash = 31 * hash + item.id().hashCode();
            hash = 31 * hash + item.quantity();
        }
        return String.valueOf(Math.abs(hash));
    }
}
