package com.github.pigeon.products.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MoneyTest {

    @Test
    @DisplayName("Should create Money with valid amount and currency")
    void shouldCreateValidMoney() {
        Money money = new Money(10000, "PLN");
        
        assertEquals(10000, money.amount());
        assertEquals("PLN", money.currency());
    }

    @Test
    @DisplayName("Should reject negative amount")
    void shouldRejectNegativeAmount() {
        assertThrows(IllegalArgumentException.class, () -> new Money(-100, "PLN"));
    }

    @Test
    @DisplayName("Should reject null currency")
    void shouldRejectNullCurrency() {
        assertThrows(IllegalArgumentException.class, () -> new Money(100, null));
    }

    @Test
    @DisplayName("Should reject non-PLN currency")
    void shouldRejectNonPLNCurrency() {
        assertThrows(IllegalArgumentException.class, () -> new Money(100, "USD"));
    }

    @Test
    @DisplayName("Should accept zero amount")
    void shouldAcceptZeroAmount() {
        Money money = new Money(0, "PLN");
        assertEquals(0, money.amount());
    }
}
