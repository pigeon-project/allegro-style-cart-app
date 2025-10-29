package com.github.pigeon.cart.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SellerTest {

    @Test
    @DisplayName("Should create seller with valid parameters")
    void shouldCreateSellerWithValidParameters() {
        UUID id = UUID.randomUUID();
        String name = "Test Seller";

        Seller seller = new Seller(id, name);

        assertNotNull(seller);
        assertEquals(id, seller.id());
        assertEquals(name, seller.name());
    }

    @Test
    @DisplayName("Should reject blank name")
    void shouldRejectBlankName() {
        assertThrows(IllegalArgumentException.class, () ->
                new Seller(UUID.randomUUID(), "")
        );
    }

    @Test
    @DisplayName("Should reject null name")
    void shouldRejectNullName() {
        assertThrows(IllegalArgumentException.class, () ->
                new Seller(UUID.randomUUID(), null)
        );
    }

    @Test
    @DisplayName("Should reject whitespace-only name")
    void shouldRejectWhitespaceOnlyName() {
        assertThrows(IllegalArgumentException.class, () ->
                new Seller(UUID.randomUUID(), "   ")
        );
    }

    @Test
    @DisplayName("Should reject null seller ID")
    void shouldRejectNullSellerId() {
        assertThrows(IllegalArgumentException.class, () ->
                new Seller(null, "Test Seller")
        );
    }
}
