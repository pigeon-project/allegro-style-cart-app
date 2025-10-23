package com.github.pigeon.cart.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class QuoteRequestTest {

    @Test
    @DisplayName("Should create QuoteRequest with items")
    void shouldCreateValidQuoteRequest() {
        QuoteRequest.QuoteItem item1 = new QuoteRequest.QuoteItem("product-1", 2);
        QuoteRequest.QuoteItem item2 = new QuoteRequest.QuoteItem("product-2", 1);
        
        QuoteRequest request = new QuoteRequest("cart-123", List.of(item1, item2));
        
        assertEquals("cart-123", request.cartId());
        assertEquals(2, request.items().size());
        assertEquals(item1, request.items().get(0));
        assertEquals(item2, request.items().get(1));
    }

    @Test
    @DisplayName("Should create QuoteRequest with empty items list")
    void shouldCreateQuoteRequestWithEmptyItems() {
        QuoteRequest request = new QuoteRequest("cart-123", List.of());
        
        assertEquals("cart-123", request.cartId());
        assertEquals(0, request.items().size());
    }

    @Test
    @DisplayName("Should reject null cartId")
    void shouldRejectNullCartId() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteRequest(null, List.of()));
    }

    @Test
    @DisplayName("Should reject blank cartId")
    void shouldRejectBlankCartId() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteRequest("  ", List.of()));
    }

    @Test
    @DisplayName("Should reject null items")
    void shouldRejectNullItems() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteRequest("cart-123", null));
    }

    @Test
    @DisplayName("Should create QuoteItem with valid data")
    void shouldCreateValidQuoteItem() {
        QuoteRequest.QuoteItem item = new QuoteRequest.QuoteItem("product-123", 5);
        
        assertEquals("product-123", item.productId());
        assertEquals(5, item.quantity());
    }

    @Test
    @DisplayName("Should reject null productId in QuoteItem")
    void shouldRejectNullProductIdInQuoteItem() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteRequest.QuoteItem(null, 1));
    }

    @Test
    @DisplayName("Should reject blank productId in QuoteItem")
    void shouldRejectBlankProductIdInQuoteItem() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteRequest.QuoteItem("  ", 1));
    }

    @Test
    @DisplayName("Should reject zero quantity in QuoteItem")
    void shouldRejectZeroQuantityInQuoteItem() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteRequest.QuoteItem("product-123", 0));
    }

    @Test
    @DisplayName("Should reject negative quantity in QuoteItem")
    void shouldRejectNegativeQuantityInQuoteItem() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteRequest.QuoteItem("product-123", -1));
    }
}
