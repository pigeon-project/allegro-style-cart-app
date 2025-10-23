package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CartSnapshotTest {

    @Test
    @DisplayName("Should create CartSnapshot with items")
    void shouldCreateValidCartSnapshot() {
        Money price = new Money(10000, "PLN");
        CartItem item = new CartItem("item-1", "product-1", 2, price, null);
        
        Money subtotal = new Money(20000, "PLN");
        Money delivery = new Money(0, "PLN");
        Money total = new Money(20000, "PLN");
        CartComputed computed = new CartComputed(subtotal, delivery, total);
        
        CartSnapshot snapshot = new CartSnapshot("cart-123", List.of(item), computed);
        
        assertEquals("cart-123", snapshot.cartId());
        assertEquals(1, snapshot.items().size());
        assertEquals(item, snapshot.items().get(0));
        assertEquals(computed, snapshot.computed());
    }

    @Test
    @DisplayName("Should create CartSnapshot with empty items list")
    void shouldCreateCartSnapshotWithEmptyItems() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        CartSnapshot snapshot = new CartSnapshot("cart-123", Collections.emptyList(), computed);
        
        assertEquals("cart-123", snapshot.cartId());
        assertEquals(0, snapshot.items().size());
        assertEquals(computed, snapshot.computed());
    }

    @Test
    @DisplayName("Should create CartSnapshot with multiple items")
    void shouldCreateCartSnapshotWithMultipleItems() {
        Money price1 = new Money(10000, "PLN");
        Money price2 = new Money(5000, "PLN");
        CartItem item1 = new CartItem("item-1", "product-1", 2, price1, null);
        CartItem item2 = new CartItem("item-2", "product-2", 1, price2, null);
        
        Money subtotal = new Money(25000, "PLN");
        Money delivery = new Money(1500, "PLN");
        Money total = new Money(26500, "PLN");
        CartComputed computed = new CartComputed(subtotal, delivery, total);
        
        CartSnapshot snapshot = new CartSnapshot("cart-123", List.of(item1, item2), computed);
        
        assertEquals("cart-123", snapshot.cartId());
        assertEquals(2, snapshot.items().size());
        assertEquals(item1, snapshot.items().get(0));
        assertEquals(item2, snapshot.items().get(1));
        assertEquals(computed, snapshot.computed());
    }

    @Test
    @DisplayName("Should reject null cartId")
    void shouldRejectNullCartId() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        assertThrows(IllegalArgumentException.class, () -> 
            new CartSnapshot(null, Collections.emptyList(), computed));
    }

    @Test
    @DisplayName("Should reject blank cartId")
    void shouldRejectBlankCartId() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        assertThrows(IllegalArgumentException.class, () -> 
            new CartSnapshot("  ", Collections.emptyList(), computed));
    }

    @Test
    @DisplayName("Should reject null items")
    void shouldRejectNullItems() {
        Money zero = new Money(0, "PLN");
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        assertThrows(IllegalArgumentException.class, () -> 
            new CartSnapshot("cart-123", null, computed));
    }

    @Test
    @DisplayName("Should reject null computed")
    void shouldRejectNullComputed() {
        assertThrows(IllegalArgumentException.class, () -> 
            new CartSnapshot("cart-123", Collections.emptyList(), null));
    }
}
