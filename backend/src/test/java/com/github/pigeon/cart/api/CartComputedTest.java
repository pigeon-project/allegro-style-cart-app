package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartComputedTest {

    @Test
    @DisplayName("Should create CartComputed with all required fields")
    void shouldCreateValidCartComputed() {
        Money subtotal = new Money(35000, "PLN");
        Money delivery = new Money(1500, "PLN");
        Money total = new Money(36500, "PLN");
        
        CartComputed computed = new CartComputed(subtotal, delivery, total);
        
        assertEquals(subtotal, computed.subtotal());
        assertEquals(delivery, computed.delivery());
        assertEquals(total, computed.total());
    }

    @Test
    @DisplayName("Should create CartComputed with zero delivery")
    void shouldCreateCartComputedWithZeroDelivery() {
        Money subtotal = new Money(35000, "PLN");
        Money delivery = new Money(0, "PLN");
        Money total = new Money(35000, "PLN");
        
        CartComputed computed = new CartComputed(subtotal, delivery, total);
        
        assertEquals(subtotal, computed.subtotal());
        assertEquals(delivery, computed.delivery());
        assertEquals(total, computed.total());
    }

    @Test
    @DisplayName("Should create CartComputed with all zeros")
    void shouldCreateCartComputedWithAllZeros() {
        Money zero = new Money(0, "PLN");
        
        CartComputed computed = new CartComputed(zero, zero, zero);
        
        assertEquals(zero, computed.subtotal());
        assertEquals(zero, computed.delivery());
        assertEquals(zero, computed.total());
    }

    @Test
    @DisplayName("Should reject null subtotal")
    void shouldRejectNullSubtotal() {
        Money delivery = new Money(1500, "PLN");
        Money total = new Money(36500, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> 
            new CartComputed(null, delivery, total));
    }

    @Test
    @DisplayName("Should reject null delivery")
    void shouldRejectNullDelivery() {
        Money subtotal = new Money(35000, "PLN");
        Money total = new Money(36500, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> 
            new CartComputed(subtotal, null, total));
    }

    @Test
    @DisplayName("Should reject null total")
    void shouldRejectNullTotal() {
        Money subtotal = new Money(35000, "PLN");
        Money delivery = new Money(1500, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> 
            new CartComputed(subtotal, delivery, null));
    }
}
