package com.github.pigeon.cart.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CartItemTest {

    @Test
    @DisplayName("Should create cart item with valid parameters")
    void shouldCreateCartItemWithValidParameters() {
        UUID id = UUID.randomUUID();
        UUID cartId = UUID.randomUUID();
        UUID sellerId = UUID.randomUUID();
        String image = "https://example.com/image.jpg";
        String title = "Test Product";
        BigDecimal price = new BigDecimal("99.99");
        int quantity = 5;

        CartItem cartItem = new CartItem(id, cartId, sellerId, image, title, price, quantity);

        assertNotNull(cartItem);
        assertEquals(id, cartItem.id());
        assertEquals(cartId, cartItem.cartId());
        assertEquals(sellerId, cartItem.sellerId());
        assertEquals(image, cartItem.productImage());
        assertEquals(title, cartItem.productTitle());
        assertEquals(price, cartItem.pricePerUnit());
        assertEquals(quantity, cartItem.quantity());
    }

    @Test
    @DisplayName("Should calculate total price correctly")
    void shouldCalculateTotalPriceCorrectly() {
        CartItem cartItem = new CartItem(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                "image.jpg", "Product", new BigDecimal("10.50"), 3
        );

        BigDecimal total = cartItem.totalPrice();

        assertEquals(new BigDecimal("31.50"), total);
    }

    @Test
    @DisplayName("Should reject blank product title")
    void shouldRejectBlankProductTitle() {
        assertThrows(IllegalArgumentException.class, () ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "", new BigDecimal("10.00"), 1)
        );
    }

    @Test
    @DisplayName("Should reject null product title")
    void shouldRejectNullProductTitle() {
        assertThrows(IllegalArgumentException.class, () ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", null, new BigDecimal("10.00"), 1)
        );
    }

    @Test
    @DisplayName("Should reject null price")
    void shouldRejectNullPrice() {
        assertThrows(IllegalArgumentException.class, () ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "Product", null, 1)
        );
    }

    @Test
    @DisplayName("Should reject zero price")
    void shouldRejectZeroPrice() {
        assertThrows(IllegalArgumentException.class, () ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "Product", BigDecimal.ZERO, 1)
        );
    }

    @Test
    @DisplayName("Should reject negative price")
    void shouldRejectNegativePrice() {
        assertThrows(IllegalArgumentException.class, () ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "Product", new BigDecimal("-10.00"), 1)
        );
    }

    @Test
    @DisplayName("Should reject quantity less than 1")
    void shouldRejectQuantityLessThan1() {
        assertThrows(IllegalArgumentException.class, () ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "Product", new BigDecimal("10.00"), 0)
        );
    }

    @Test
    @DisplayName("Should reject quantity greater than 99")
    void shouldRejectQuantityGreaterThan99() {
        assertThrows(IllegalArgumentException.class, () ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "Product", new BigDecimal("10.00"), 100)
        );
    }

    @Test
    @DisplayName("Should accept quantity of 1")
    void shouldAcceptQuantityOf1() {
        assertDoesNotThrow(() ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "Product", new BigDecimal("10.00"), 1)
        );
    }

    @Test
    @DisplayName("Should accept quantity of 99")
    void shouldAcceptQuantityOf99() {
        assertDoesNotThrow(() ->
                new CartItem(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        "image.jpg", "Product", new BigDecimal("10.00"), 99)
        );
    }

    @Test
    @DisplayName("Should accept null product image")
    void shouldAcceptNullProductImage() {
        CartItem cartItem = new CartItem(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                null, "Product", new BigDecimal("10.00"), 1
        );

        assertNotNull(cartItem);
        assertNull(cartItem.productImage());
    }
}
