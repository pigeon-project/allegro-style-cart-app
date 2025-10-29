package com.github.pigeon.cart.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CartTest {

    @Test
    @DisplayName("Should create cart with valid parameters")
    void shouldCreateCartWithValidParameters() {
        UUID id = UUID.randomUUID();
        String userId = "user123";

        Cart cart = new Cart(id, userId);

        assertNotNull(cart);
        assertEquals(id, cart.id());
        assertEquals(userId, cart.userId());
    }

    @Test
    @DisplayName("Should reject blank user ID")
    void shouldRejectBlankUserId() {
        assertThrows(IllegalArgumentException.class, () ->
                new Cart(UUID.randomUUID(), "")
        );
    }

    @Test
    @DisplayName("Should reject null user ID")
    void shouldRejectNullUserId() {
        assertThrows(IllegalArgumentException.class, () ->
                new Cart(UUID.randomUUID(), null)
        );
    }

    @Test
    @DisplayName("Should reject whitespace-only user ID")
    void shouldRejectWhitespaceOnlyUserId() {
        assertThrows(IllegalArgumentException.class, () ->
                new Cart(UUID.randomUUID(), "   ")
        );
    }
}
