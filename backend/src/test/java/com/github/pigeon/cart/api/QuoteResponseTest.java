package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class QuoteResponseTest {

    @Test
    @DisplayName("Should create QuoteResponse with items")
    void shouldCreateValidQuoteResponse() {
        Money price = new Money(10000, "PLN");
        CartItem item = new CartItem("item-1", "product-1", 2, price, null);
        
        Money subtotal = new Money(20000, "PLN");
        Money delivery = new Money(0, "PLN");
        Money total = new Money(20000, "PLN");
        CartComputed computed = new CartComputed(subtotal, delivery, total);
        
        QuoteResponse response = new QuoteResponse("cart-123", List.of(item), computed);
        
        assertEquals("cart-123", response.cartId());
        assertEquals(1, response.items().size());
        assertEquals(item, response.items().get(0));
        assertEquals(computed, response.computed());
    }

    @Test
    @DisplayName("Should create QuoteResponse from CartSnapshot")
    void shouldCreateFromCartSnapshot() {
        Money price = new Money(10000, "PLN");
        CartItem item = new CartItem("item-1", "product-1", 2, price, null);
        
        Money subtotal = new Money(20000, "PLN");
        Money delivery = new Money(0, "PLN");
        Money total = new Money(20000, "PLN");
        CartComputed computed = new CartComputed(subtotal, delivery, total);
        
        CartSnapshot snapshot = new CartSnapshot("cart-123", List.of(item), computed);
        QuoteResponse response = QuoteResponse.fromCartSnapshot(snapshot);
        
        assertEquals(snapshot.cartId(), response.cartId());
        assertEquals(snapshot.items(), response.items());
        assertEquals(snapshot.computed(), response.computed());
    }

    @Test
    @DisplayName("Should create QuoteResponse with empty items")
    void shouldCreateQuoteResponseWithEmptyItems() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        QuoteResponse response = new QuoteResponse("cart-123", Collections.emptyList(), computed);
        
        assertEquals("cart-123", response.cartId());
        assertEquals(0, response.items().size());
        assertEquals(computed, response.computed());
    }

    @Test
    @DisplayName("Should reject null cartId")
    void shouldRejectNullCartId() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteResponse(null, Collections.emptyList(), computed));
    }

    @Test
    @DisplayName("Should reject blank cartId")
    void shouldRejectBlankCartId() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteResponse("  ", Collections.emptyList(), computed));
    }

    @Test
    @DisplayName("Should reject null items")
    void shouldRejectNullItems() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteResponse("cart-123", null, computed));
    }

    @Test
    @DisplayName("Should reject null computed")
    void shouldRejectNullComputed() {
        assertThrows(IllegalArgumentException.class, () -> 
            new QuoteResponse("cart-123", Collections.emptyList(), null));
    }
}
