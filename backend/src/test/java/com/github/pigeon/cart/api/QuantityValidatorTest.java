package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Availability;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QuantityValidatorTest {

    @Test
    @DisplayName("Should validate and return quantity within bounds")
    void shouldReturnQuantityWithinBounds() {
        Availability availability = new Availability(true, 100);
        
        int result = QuantityValidator.validateAndClip(5, 1, 10, availability);
        
        assertEquals(5, result);
    }

    @Test
    @DisplayName("Should clip quantity to min when below minimum")
    void shouldClipToMinimum() {
        Availability availability = new Availability(true, 100);
        
        int result = QuantityValidator.validateAndClip(0, 1, 10, availability);
        
        assertEquals(1, result);
    }

    @Test
    @DisplayName("Should clip quantity to max when above maximum")
    void shouldClipToMaximum() {
        Availability availability = new Availability(true, 100);
        
        int result = QuantityValidator.validateAndClip(15, 1, 10, availability);
        
        assertEquals(10, result);
    }

    @Test
    @DisplayName("Should clip to maxOrderable when maxQty exceeds it")
    void shouldClipToMaxOrderable() {
        Availability availability = new Availability(true, 5);
        
        int result = QuantityValidator.validateAndClip(10, 1, 99, availability);
        
        assertEquals(5, result);
    }

    @Test
    @DisplayName("Should use default min of 1 when minQty is null")
    void shouldUseDefaultMinQuantity() {
        Availability availability = new Availability(true, 100);
        
        int result = QuantityValidator.validateAndClip(0, null, 10, availability);
        
        assertEquals(1, result);
    }

    @Test
    @DisplayName("Should use default max of 99 when maxQty is null")
    void shouldUseDefaultMaxQuantity() {
        Availability availability = new Availability(true, 100);
        
        int result = QuantityValidator.validateAndClip(100, 1, null, availability);
        
        assertEquals(99, result);
    }

    @Test
    @DisplayName("Should use defaults for both min and max when null")
    void shouldUseDefaultsForBothMinAndMax() {
        Availability availability = new Availability(true, 100);
        
        int resultMin = QuantityValidator.validateAndClip(0, null, null, availability);
        int resultMax = QuantityValidator.validateAndClip(100, null, null, availability);
        
        assertEquals(1, resultMin);
        assertEquals(99, resultMax);
    }

    @Test
    @DisplayName("Should clip to maxOrderable when it's less than default max")
    void shouldClipToMaxOrderableWithDefaults() {
        Availability availability = new Availability(true, 50);
        
        int result = QuantityValidator.validateAndClip(75, null, null, availability);
        
        assertEquals(50, result);
    }

    @Test
    @DisplayName("Should handle edge case where maxOrderable is less than minQty")
    void shouldHandleMaxOrderableLessThanMinQty() {
        Availability availability = new Availability(true, 2);
        
        int result = QuantityValidator.validateAndClip(5, 5, 10, availability);
        
        // The upper bound is min(10, 2) = 2
        // The clipped value is max(5, min(5, 2)) = max(5, 2) = 5
        // But since 5 > 2, it should be clipped to 2
        // Actually: Math.max(minQty, Math.min(requestedQuantity, upperBound))
        // upperBound = min(10, 2) = 2
        // Math.min(5, 2) = 2
        // Math.max(5, 2) = 5 - This is incorrect!
        // The issue is that minQty can exceed the upper bound.
        // We need to return the minimum possible which is 2.
        assertEquals(2, result);
    }

    @Test
    @DisplayName("Should handle negative requested quantity")
    void shouldHandleNegativeQuantity() {
        Availability availability = new Availability(true, 100);
        
        int result = QuantityValidator.validateAndClip(-5, 1, 10, availability);
        
        assertEquals(1, result);
    }

    @Test
    @DisplayName("Should handle very large requested quantity")
    void shouldHandleVeryLargeQuantity() {
        Availability availability = new Availability(true, 100);
        
        int result = QuantityValidator.validateAndClip(1000, 1, 50, availability);
        
        assertEquals(50, result);
    }

    @Test
    @DisplayName("Should reject null availability")
    void shouldRejectNullAvailability() {
        assertThrows(IllegalArgumentException.class, () -> 
            QuantityValidator.validateAndClip(5, 1, 10, null));
    }

    @Test
    @DisplayName("Should validate quantity as valid when within bounds")
    void shouldReturnTrueWhenQuantityIsValid() {
        Availability availability = new Availability(true, 100);
        
        assertTrue(QuantityValidator.isValid(5, 1, 10, availability));
    }

    @Test
    @DisplayName("Should validate quantity as invalid when below minimum")
    void shouldReturnFalseWhenBelowMinimum() {
        Availability availability = new Availability(true, 100);
        
        assertFalse(QuantityValidator.isValid(0, 1, 10, availability));
    }

    @Test
    @DisplayName("Should validate quantity as invalid when above maximum")
    void shouldReturnFalseWhenAboveMaximum() {
        Availability availability = new Availability(true, 100);
        
        assertFalse(QuantityValidator.isValid(15, 1, 10, availability));
    }

    @Test
    @DisplayName("Should validate quantity as invalid when above maxOrderable")
    void shouldReturnFalseWhenAboveMaxOrderable() {
        Availability availability = new Availability(true, 5);
        
        assertFalse(QuantityValidator.isValid(10, 1, 99, availability));
    }

    @Test
    @DisplayName("Should validate with default constraints")
    void shouldValidateWithDefaultConstraints() {
        Availability availability = new Availability(true, 100);
        
        assertTrue(QuantityValidator.isValid(50, null, null, availability));
        assertFalse(QuantityValidator.isValid(0, null, null, availability));
        assertFalse(QuantityValidator.isValid(100, null, null, availability));
    }

    @Test
    @DisplayName("Should validate at boundary values")
    void shouldValidateAtBoundaries() {
        Availability availability = new Availability(true, 100);
        
        assertTrue(QuantityValidator.isValid(1, 1, 10, availability));
        assertTrue(QuantityValidator.isValid(10, 1, 10, availability));
        assertFalse(QuantityValidator.isValid(0, 1, 10, availability));
        assertFalse(QuantityValidator.isValid(11, 1, 10, availability));
    }

    @Test
    @DisplayName("Should validate with maxOrderable as limiting factor")
    void shouldValidateWithMaxOrderableAsLimit() {
        Availability availability = new Availability(true, 5);
        
        assertTrue(QuantityValidator.isValid(5, 1, 10, availability));
        assertFalse(QuantityValidator.isValid(6, 1, 10, availability));
    }

    @Test
    @DisplayName("Should reject null availability in isValid")
    void shouldRejectNullAvailabilityInIsValid() {
        assertThrows(IllegalArgumentException.class, () -> 
            QuantityValidator.isValid(5, 1, 10, null));
    }
}
