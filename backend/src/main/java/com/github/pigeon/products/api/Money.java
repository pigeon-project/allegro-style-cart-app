package com.github.pigeon.products.api;

/**
 * Represents a monetary amount in Polish currency.
 * The amount is stored in grosze (1 PLN = 100 grosze).
 */
public record Money(int amount, String currency) {
    
    public Money {
        if (amount < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        if (currency == null || !currency.equals("PLN")) {
            throw new IllegalArgumentException("Currency must be PLN");
        }
    }
}
