package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartItemTest {

    @Test
    @DisplayName("Should create CartItem with all required fields")
    void shouldCreateValidCartItem() {
        Money price = new Money(10000, "PLN");
        Money listPrice = new Money(15000, "PLN");
        
        CartItem item = new CartItem(
            "item-123",
            "product-456",
            3,
            price,
            listPrice
        );
        
        assertEquals("item-123", item.itemId());
        assertEquals("product-456", item.productId());
        assertEquals(3, item.quantity());
        assertEquals(price, item.price());
        assertEquals(listPrice, item.listPrice());
    }

    @Test
    @DisplayName("Should create CartItem with null listPrice")
    void shouldCreateCartItemWithNullListPrice() {
        Money price = new Money(10000, "PLN");
        
        CartItem item = new CartItem(
            "item-123",
            "product-456",
            1,
            price,
            null
        );
        
        assertNotNull(item);
        assertNull(item.listPrice());
    }

    @Test
    @DisplayName("Should reject null itemId")
    void shouldRejectNullItemId() {
        Money price = new Money(10000, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> new CartItem(
            null,
            "product-456",
            1,
            price,
            null
        ));
    }

    @Test
    @DisplayName("Should reject blank itemId")
    void shouldRejectBlankItemId() {
        Money price = new Money(10000, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> new CartItem(
            "  ",
            "product-456",
            1,
            price,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null productId")
    void shouldRejectNullProductId() {
        Money price = new Money(10000, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> new CartItem(
            "item-123",
            null,
            1,
            price,
            null
        ));
    }

    @Test
    @DisplayName("Should reject blank productId")
    void shouldRejectBlankProductId() {
        Money price = new Money(10000, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> new CartItem(
            "item-123",
            "  ",
            1,
            price,
            null
        ));
    }

    @Test
    @DisplayName("Should reject zero quantity")
    void shouldRejectZeroQuantity() {
        Money price = new Money(10000, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> new CartItem(
            "item-123",
            "product-456",
            0,
            price,
            null
        ));
    }

    @Test
    @DisplayName("Should reject negative quantity")
    void shouldRejectNegativeQuantity() {
        Money price = new Money(10000, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> new CartItem(
            "item-123",
            "product-456",
            -1,
            price,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null price")
    void shouldRejectNullPrice() {
        assertThrows(IllegalArgumentException.class, () -> new CartItem(
            "item-123",
            "product-456",
            1,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should accept quantity of 1")
    void shouldAcceptQuantityOfOne() {
        Money price = new Money(10000, "PLN");
        
        CartItem item = new CartItem(
            "item-123",
            "product-456",
            1,
            price,
            null
        );
        
        assertEquals(1, item.quantity());
    }

    @Test
    @DisplayName("Should accept large quantity")
    void shouldAcceptLargeQuantity() {
        Money price = new Money(10000, "PLN");
        
        CartItem item = new CartItem(
            "item-123",
            "product-456",
            999,
            price,
            null
        );
        
        assertEquals(999, item.quantity());
    }
}
