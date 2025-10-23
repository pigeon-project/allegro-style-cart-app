package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Utility class for cart calculations using business rules.
 * All monetary calculations use banker's rounding (HALF_EVEN).
 */
public final class CartCalculations {
    
    private static final String CURRENCY = "PLN";
    private static final int SCALE = 2;
    
    private CartCalculations() {
        // Utility class
    }
    
    /**
     * Calculates the line total for a cart item.
     * LineTotal = quantity × price
     * 
     * @param item The cart item
     * @return The line total as Money
     */
    public static Money calculateLineTotal(CartItem item) {
        BigDecimal price = groszeToPln(item.price().amount());
        BigDecimal quantity = new BigDecimal(item.quantity());
        BigDecimal lineTotal = price.multiply(quantity);
        
        return plnToGrosze(lineTotal);
    }
    
    /**
     * Calculates the savings per line for a cart item.
     * SavingsPerLine = quantity × (listPrice - price)
     * Returns zero if listPrice is null or less than price.
     * 
     * @param item The cart item
     * @return The savings per line as Money
     */
    public static Money calculateSavingsPerLine(CartItem item) {
        if (item.listPrice() == null) {
            return new Money(0, CURRENCY);
        }
        
        BigDecimal listPrice = groszeToPln(item.listPrice().amount());
        BigDecimal price = groszeToPln(item.price().amount());
        BigDecimal savings = listPrice.subtract(price);
        
        if (savings.compareTo(BigDecimal.ZERO) <= 0) {
            return new Money(0, CURRENCY);
        }
        
        BigDecimal quantity = new BigDecimal(item.quantity());
        BigDecimal savingsPerLine = savings.multiply(quantity);
        
        return plnToGrosze(savingsPerLine);
    }
    
    /**
     * Calculates the subtotal for a list of cart items.
     * Subtotal = sum(LineTotal)
     * 
     * @param items The list of cart items
     * @return The subtotal as Money
     */
    public static Money calculateSubtotal(List<CartItem> items) {
        BigDecimal subtotal = items.stream()
                .map(CartCalculations::calculateLineTotal)
                .map(money -> groszeToPln(money.amount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return plnToGrosze(subtotal);
    }
    
    /**
     * Calculates the total savings for a list of cart items.
     * TotalSavings = sum(SavingsPerLine)
     * 
     * @param items The list of cart items
     * @return The total savings as Money
     */
    public static Money calculateTotalSavings(List<CartItem> items) {
        BigDecimal totalSavings = items.stream()
                .map(CartCalculations::calculateSavingsPerLine)
                .map(money -> groszeToPln(money.amount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return plnToGrosze(totalSavings);
    }
    
    /**
     * Calculates the grand total.
     * GrandTotal = Subtotal + Delivery
     * 
     * @param subtotal The subtotal
     * @param delivery The delivery cost
     * @return The grand total as Money
     */
    public static Money calculateGrandTotal(Money subtotal, Money delivery) {
        BigDecimal subtotalPln = groszeToPln(subtotal.amount());
        BigDecimal deliveryPln = groszeToPln(delivery.amount());
        BigDecimal grandTotal = subtotalPln.add(deliveryPln);
        
        return plnToGrosze(grandTotal);
    }
    
    /**
     * Converts grosze (smallest unit) to PLN with proper scale.
     * 
     * @param grosze The amount in grosze
     * @return The amount in PLN as BigDecimal
     */
    private static BigDecimal groszeToPln(int grosze) {
        return new BigDecimal(grosze).divide(new BigDecimal(100), SCALE, RoundingMode.HALF_EVEN);
    }
    
    /**
     * Converts PLN to grosze (smallest unit) using banker's rounding.
     * 
     * @param pln The amount in PLN
     * @return The amount in grosze as Money
     */
    private static Money plnToGrosze(BigDecimal pln) {
        BigDecimal grosze = pln.multiply(new BigDecimal(100));
        int amount = grosze.setScale(0, RoundingMode.HALF_EVEN).intValue();
        return new Money(amount, CURRENCY);
    }
}
