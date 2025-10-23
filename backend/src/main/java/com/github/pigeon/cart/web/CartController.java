package com.github.pigeon.cart.web;

import com.github.pigeon.cart.api.*;
import com.github.pigeon.products.api.Money;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carts")
@Tag(name = "Cart", description = "Cart API for managing shopping cart and calculating quotes")
class CartController {

    private final CartRepository cartRepository;
    private final CartStore cartStore;

    CartController(CartRepository cartRepository, CartStore cartStore) {
        this.cartRepository = cartRepository;
        this.cartStore = cartStore;
    }

    @Operation(
        summary = "Add item to cart",
        description = "Adds a new item to the cart and returns a quote with validated prices and availability."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Item added successfully, quote returned",
            content = @Content(schema = @Schema(implementation = QuoteResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request (invalid productId or quantity)",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    @PostMapping("/{cartId}/items")
    QuoteResponse addItem(
        @Parameter(description = "Cart ID", required = true)
        @PathVariable("cartId") String cartId,
        @RequestBody AddItemRequest request
    ) {
        // Get current cart or create empty one
        CartSnapshot currentCart = cartStore.getCart(cartId).orElse(
            new CartSnapshot(cartId, List.of(), new CartComputed(
                new Money(0, "PLN"),
                new Money(0, "PLN"),
                new Money(0, "PLN")
            ))
        );
        
        // Build list of items: current items + new item
        List<QuoteRequest.QuoteItem> allItems = currentCart.items().stream()
                .map(item -> new QuoteRequest.QuoteItem(item.productId(), item.quantity()))
                .collect(Collectors.toCollection(ArrayList::new));
        allItems.add(new QuoteRequest.QuoteItem(request.productId(), request.quantity()));
        
        // Calculate quote
        QuoteRequest quoteRequest = new QuoteRequest(cartId, allItems);
        QuoteResponse response = cartRepository.calculateQuote(quoteRequest);
        
        // Save updated cart
        CartSnapshot updatedCart = new CartSnapshot(
            response.cartId(),
            response.items(),
            response.computed()
        );
        cartStore.saveCart(updatedCart);
        
        return response;
    }

    @Operation(
        summary = "Update item quantity",
        description = "Updates the quantity of an existing cart item and returns a quote."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Item quantity updated successfully, quote returned",
            content = @Content(schema = @Schema(implementation = QuoteResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request (invalid quantity)",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Cart or item not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    @PatchMapping("/{cartId}/items/{itemId}")
    QuoteResponse updateItem(
        @Parameter(description = "Cart ID", required = true)
        @PathVariable("cartId") String cartId,
        @Parameter(description = "Item ID to update", required = true)
        @PathVariable("itemId") String itemId,
        @RequestBody UpdateItemRequest request
    ) {
        // Get current cart
        CartSnapshot currentCart = cartStore.getCart(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        // Find the item to update
        CartItem itemToUpdate = currentCart.items().stream()
                .filter(item -> item.itemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not found in cart: " + itemId));
        
        // Build updated items list with new quantity
        List<QuoteRequest.QuoteItem> updatedItems = currentCart.items().stream()
                .map(item -> {
                    if (item.itemId().equals(itemId)) {
                        return new QuoteRequest.QuoteItem(item.productId(), request.quantity());
                    }
                    return new QuoteRequest.QuoteItem(item.productId(), item.quantity());
                })
                .toList();
        
        // Calculate quote
        QuoteRequest quoteRequest = new QuoteRequest(cartId, updatedItems);
        QuoteResponse response = cartRepository.calculateQuote(quoteRequest);
        
        // Save updated cart
        CartSnapshot updatedCart = new CartSnapshot(
            response.cartId(),
            response.items(),
            response.computed()
        );
        cartStore.saveCart(updatedCart);
        
        return response;
    }

    @Operation(
        summary = "Remove item from cart",
        description = "Removes an item from the cart and returns a quote."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Item removed successfully, quote returned",
            content = @Content(schema = @Schema(implementation = QuoteResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Cart or item not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    @DeleteMapping("/{cartId}/items/{itemId}")
    QuoteResponse removeItem(
        @Parameter(description = "Cart ID", required = true)
        @PathVariable("cartId") String cartId,
        @Parameter(description = "Item ID to remove", required = true)
        @PathVariable("itemId") String itemId
    ) {
        // Get current cart
        CartSnapshot currentCart = cartStore.getCart(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        // Verify the item exists
        boolean itemExists = currentCart.items().stream()
                .anyMatch(item -> item.itemId().equals(itemId));
        
        if (!itemExists) {
            throw new IllegalArgumentException("Item not found in cart: " + itemId);
        }
        
        // Build items list without the removed item
        List<QuoteRequest.QuoteItem> remainingItems = currentCart.items().stream()
                .filter(item -> !item.itemId().equals(itemId))
                .map(item -> new QuoteRequest.QuoteItem(item.productId(), item.quantity()))
                .toList();
        
        // Calculate quote for remaining items
        QuoteResponse response;
        if (remainingItems.isEmpty()) {
            // Empty cart
            response = new QuoteResponse(
                cartId,
                List.of(),
                new CartComputed(
                    new Money(0, "PLN"),
                    new Money(0, "PLN"),
                    new Money(0, "PLN")
                )
            );
        } else {
            QuoteRequest quoteRequest = new QuoteRequest(cartId, remainingItems);
            response = cartRepository.calculateQuote(quoteRequest);
        }
        
        // Save updated cart
        CartSnapshot updatedCart = new CartSnapshot(
            response.cartId(),
            response.items(),
            response.computed()
        );
        cartStore.saveCart(updatedCart);
        
        return response;
    }

    @Operation(
        summary = "Calculate cart quote",
        description = "Calculates a quote for the cart with validated prices and availability. " +
                     "This is a stateless operation that validates current prices against the product catalog."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Quote calculated successfully",
            content = @Content(schema = @Schema(implementation = QuoteResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request (invalid cart state or items)",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "One or more products not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    @PostMapping("/{cartId}/quote")
    QuoteResponse calculateQuote(
        @Parameter(description = "Cart ID", required = true)
        @PathVariable("cartId") String cartId,
        @RequestBody QuoteRequest request
    ) {
        // Validate that the cartId in the path matches the request body
        if (!cartId.equals(request.cartId())) {
            throw new IllegalArgumentException("Cart ID in path does not match request body");
        }
        
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Save cart snapshot
        CartSnapshot snapshot = new CartSnapshot(
            response.cartId(),
            response.items(),
            response.computed()
        );
        cartStore.saveCart(snapshot);
        
        return response;
    }
}
