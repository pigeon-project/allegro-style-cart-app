package com.github.pigeon.products.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AvailabilityTest {

    @Test
    @DisplayName("Should create Availability with valid values")
    void shouldCreateValidAvailability() {
        Availability availability = new Availability(true, 100);
        
        assertTrue(availability.inStock());
        assertEquals(100, availability.maxOrderable());
    }

    @Test
    @DisplayName("Should create Availability with out of stock")
    void shouldCreateAvailabilityOutOfStock() {
        Availability availability = new Availability(false, 0);
        
        assertFalse(availability.inStock());
        assertEquals(0, availability.maxOrderable());
    }

    @Test
    @DisplayName("Should reject negative max orderable")
    void shouldRejectNegativeMaxOrderable() {
        assertThrows(IllegalArgumentException.class, () -> new Availability(true, -1));
    }

    @Test
    @DisplayName("Should accept zero max orderable")
    void shouldAcceptZeroMaxOrderable() {
        Availability availability = new Availability(false, 0);
        assertEquals(0, availability.maxOrderable());
    }
}
