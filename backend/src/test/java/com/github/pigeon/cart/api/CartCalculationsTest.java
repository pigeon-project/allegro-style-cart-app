package com.github.pigeon.cart.api;

import com.github.pigeon.products.api.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CartCalculationsTest {

    @Test
    @DisplayName("Should calculate line total for single item")
    void shouldCalculateLineTotal() {
        Money price = new Money(10000, "PLN"); // 100.00 PLN
        CartItem item = new CartItem("item-1", "product-1", 3, price, null);
        
        Money lineTotal = CartCalculations.calculateLineTotal(item);
        
        assertEquals(30000, lineTotal.amount()); // 300.00 PLN
        assertEquals("PLN", lineTotal.currency());
    }

    @Test
    @DisplayName("Should calculate line total with banker's rounding")
    void shouldCalculateLineTotalWithBankersRounding() {
        // Price that results in .5 grosze when multiplied
        Money price = new Money(3333, "PLN"); // 33.33 PLN
        CartItem item = new CartItem("item-1", "product-1", 3, price, null);
        
        Money lineTotal = CartCalculations.calculateLineTotal(item);
        
        // 33.33 * 3 = 99.99, no rounding needed
        assertEquals(9999, lineTotal.amount());
    }

    @Test
    @DisplayName("Should calculate savings per line when listPrice is higher")
    void shouldCalculateSavingsPerLine() {
        Money price = new Money(8000, "PLN"); // 80.00 PLN
        Money listPrice = new Money(10000, "PLN"); // 100.00 PLN
        CartItem item = new CartItem("item-1", "product-1", 2, price, listPrice);
        
        Money savings = CartCalculations.calculateSavingsPerLine(item);
        
        assertEquals(4000, savings.amount()); // 40.00 PLN (20.00 * 2)
        assertEquals("PLN", savings.currency());
    }

    @Test
    @DisplayName("Should return zero savings when listPrice is null")
    void shouldReturnZeroSavingsWhenListPriceIsNull() {
        Money price = new Money(10000, "PLN");
        CartItem item = new CartItem("item-1", "product-1", 2, price, null);
        
        Money savings = CartCalculations.calculateSavingsPerLine(item);
        
        assertEquals(0, savings.amount());
        assertEquals("PLN", savings.currency());
    }

    @Test
    @DisplayName("Should return zero savings when listPrice equals price")
    void shouldReturnZeroSavingsWhenListPriceEqualsPrice() {
        Money price = new Money(10000, "PLN");
        Money listPrice = new Money(10000, "PLN");
        CartItem item = new CartItem("item-1", "product-1", 2, price, listPrice);
        
        Money savings = CartCalculations.calculateSavingsPerLine(item);
        
        assertEquals(0, savings.amount());
    }

    @Test
    @DisplayName("Should return zero savings when listPrice is less than price")
    void shouldReturnZeroSavingsWhenListPriceIsLessThanPrice() {
        Money price = new Money(10000, "PLN");
        Money listPrice = new Money(8000, "PLN");
        CartItem item = new CartItem("item-1", "product-1", 2, price, listPrice);
        
        Money savings = CartCalculations.calculateSavingsPerLine(item);
        
        assertEquals(0, savings.amount());
    }

    @Test
    @DisplayName("Should calculate subtotal for multiple items")
    void shouldCalculateSubtotal() {
        Money price1 = new Money(10000, "PLN"); // 100.00 PLN
        Money price2 = new Money(5000, "PLN");  // 50.00 PLN
        CartItem item1 = new CartItem("item-1", "product-1", 2, price1, null); // 200.00 PLN
        CartItem item2 = new CartItem("item-2", "product-2", 3, price2, null); // 150.00 PLN
        
        Money subtotal = CartCalculations.calculateSubtotal(List.of(item1, item2));
        
        assertEquals(35000, subtotal.amount()); // 350.00 PLN
        assertEquals("PLN", subtotal.currency());
    }

    @Test
    @DisplayName("Should calculate subtotal for empty list")
    void shouldCalculateSubtotalForEmptyList() {
        Money subtotal = CartCalculations.calculateSubtotal(List.of());
        
        assertEquals(0, subtotal.amount());
        assertEquals("PLN", subtotal.currency());
    }

    @Test
    @DisplayName("Should calculate total savings for multiple items")
    void shouldCalculateTotalSavings() {
        Money price1 = new Money(8000, "PLN");
        Money listPrice1 = new Money(10000, "PLN");
        Money price2 = new Money(4500, "PLN");
        Money listPrice2 = new Money(5000, "PLN");
        
        CartItem item1 = new CartItem("item-1", "product-1", 2, price1, listPrice1); // Savings: 40.00 PLN
        CartItem item2 = new CartItem("item-2", "product-2", 3, price2, listPrice2); // Savings: 15.00 PLN
        
        Money totalSavings = CartCalculations.calculateTotalSavings(List.of(item1, item2));
        
        assertEquals(5500, totalSavings.amount()); // 55.00 PLN
        assertEquals("PLN", totalSavings.currency());
    }

    @Test
    @DisplayName("Should calculate total savings for empty list")
    void shouldCalculateTotalSavingsForEmptyList() {
        Money totalSavings = CartCalculations.calculateTotalSavings(List.of());
        
        assertEquals(0, totalSavings.amount());
        assertEquals("PLN", totalSavings.currency());
    }

    @Test
    @DisplayName("Should calculate grand total")
    void shouldCalculateGrandTotal() {
        Money subtotal = new Money(35000, "PLN"); // 350.00 PLN
        Money delivery = new Money(1500, "PLN");  // 15.00 PLN
        
        Money grandTotal = CartCalculations.calculateGrandTotal(subtotal, delivery);
        
        assertEquals(36500, grandTotal.amount()); // 365.00 PLN
        assertEquals("PLN", grandTotal.currency());
    }

    @Test
    @DisplayName("Should calculate grand total with zero delivery")
    void shouldCalculateGrandTotalWithZeroDelivery() {
        Money subtotal = new Money(35000, "PLN");
        Money delivery = new Money(0, "PLN");
        
        Money grandTotal = CartCalculations.calculateGrandTotal(subtotal, delivery);
        
        assertEquals(35000, grandTotal.amount());
        assertEquals("PLN", grandTotal.currency());
    }

    @Test
    @DisplayName("Should use banker's rounding for line total with .5 grosze (even)")
    void shouldUseBankersRoundingEven() {
        // Create a scenario where we get exactly 0.5 grosze
        // 1.225 PLN * 2 = 2.45 PLN -> rounds to 2.44 (even)
        Money price = new Money(1225, "PLN"); // 12.25 PLN
        CartItem item = new CartItem("item-1", "product-1", 2, price, null);
        
        Money lineTotal = CartCalculations.calculateLineTotal(item);
        
        // 12.25 * 2 = 24.50, rounds to 24.50 (no fractional grosze)
        assertEquals(2450, lineTotal.amount());
    }

    @Test
    @DisplayName("Should use banker's rounding for line total with .5 grosze (odd)")
    void shouldUseBankersRoundingOdd() {
        // Create a scenario where we get exactly 0.5 grosze
        // 1.235 PLN * 2 = 2.47 PLN -> rounds to 2.48 (even)
        Money price = new Money(1235, "PLN"); // 12.35 PLN
        CartItem item = new CartItem("item-1", "product-1", 2, price, null);
        
        Money lineTotal = CartCalculations.calculateLineTotal(item);
        
        // 12.35 * 2 = 24.70, no rounding needed
        assertEquals(2470, lineTotal.amount());
    }

    @Test
    @DisplayName("Should calculate complex cart with all features")
    void shouldCalculateComplexCart() {
        // Item 1: Regular price, no discount
        Money price1 = new Money(12999, "PLN"); // 129.99 PLN
        CartItem item1 = new CartItem("item-1", "product-1", 1, price1, null);
        
        // Item 2: With discount
        Money price2 = new Money(7999, "PLN"); // 79.99 PLN
        Money listPrice2 = new Money(9999, "PLN"); // 99.99 PLN
        CartItem item2 = new CartItem("item-2", "product-2", 2, price2, listPrice2);
        
        // Item 3: Another with discount
        Money price3 = new Money(2499, "PLN"); // 24.99 PLN
        Money listPrice3 = new Money(3499, "PLN"); // 34.99 PLN
        CartItem item3 = new CartItem("item-3", "product-3", 3, price3, listPrice3);
        
        List<CartItem> items = List.of(item1, item2, item3);
        
        // Calculate all totals
        Money subtotal = CartCalculations.calculateSubtotal(items);
        Money totalSavings = CartCalculations.calculateTotalSavings(items);
        Money delivery = new Money(0, "PLN");
        Money grandTotal = CartCalculations.calculateGrandTotal(subtotal, delivery);
        
        // Verify subtotal: 129.99 + (79.99*2) + (24.99*3) = 129.99 + 159.98 + 74.97 = 364.94
        assertEquals(36494, subtotal.amount());
        
        // Verify savings: 0 + (20.00*2) + (10.00*3) = 40.00 + 30.00 = 70.00
        assertEquals(7000, totalSavings.amount());
        
        // Verify grand total
        assertEquals(36494, grandTotal.amount());
    }
}
