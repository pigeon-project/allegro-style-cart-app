package com.github.pigeon.cart;

import com.github.pigeon.cart.api.*;
import com.github.pigeon.products.api.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for CartRepository.
 * Tests stateless quote calculation, price validation, and availability checks.
 */
@SpringBootTest
class CartRepositoryIntegrationTest {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Test
    @DisplayName("Should calculate quote for single item with correct totals")
    void shouldCalculateQuoteForSingleItem() {
        // Given - product "prod-001" exists with price 599900 grosze (5999.00 PLN)
        QuoteRequest request = new QuoteRequest(
                "cart-123",
                List.of(new QuoteRequest.QuoteItem("prod-001", 2))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then
        assertThat(response.cartId()).isEqualTo("cart-123");
        assertThat(response.items()).hasSize(1);
        
        CartItem item = response.items().get(0);
        assertThat(item.productId()).isEqualTo("prod-001");
        assertThat(item.quantity()).isEqualTo(2);
        assertThat(item.price()).isEqualTo(new Money(599900, "PLN"));
        assertThat(item.itemId()).isNotBlank();
        
        // Verify totals: 2 × 5999.00 PLN = 11998.00 PLN
        assertThat(response.computed().subtotal()).isEqualTo(new Money(1199800, "PLN"));
        assertThat(response.computed().delivery()).isEqualTo(new Money(0, "PLN"));
        assertThat(response.computed().total()).isEqualTo(new Money(1199800, "PLN"));
    }
    
    @Test
    @DisplayName("Should calculate quote for multiple items")
    void shouldCalculateQuoteForMultipleItems() {
        // Given - multiple products
        QuoteRequest request = new QuoteRequest(
                "cart-456",
                List.of(
                        new QuoteRequest.QuoteItem("prod-001", 1), // 5999.00 PLN
                        new QuoteRequest.QuoteItem("prod-002", 2), // 399.00 PLN × 2 = 798.00 PLN
                        new QuoteRequest.QuoteItem("prod-003", 3)  // 129.00 PLN × 3 = 387.00 PLN
                )
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then
        assertThat(response.items()).hasSize(3);
        assertThat(response.items()).extracting(CartItem::productId)
                .containsExactly("prod-001", "prod-002", "prod-003");
        
        // Verify subtotal: 5999.00 + 798.00 + 387.00 = 7184.00 PLN
        assertThat(response.computed().subtotal()).isEqualTo(new Money(718400, "PLN"));
        assertThat(response.computed().total()).isEqualTo(new Money(718400, "PLN"));
    }
    
    @Test
    @DisplayName("Should validate prices from product catalog")
    void shouldValidatePricesFromProductCatalog() {
        // Given
        QuoteRequest request = new QuoteRequest(
                "cart-789",
                List.of(new QuoteRequest.QuoteItem("prod-005", 1))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then - price should match current product catalog price
        CartItem item = response.items().get(0);
        assertThat(item.price().amount()).isPositive();
        assertThat(item.price().currency()).isEqualTo("PLN");
    }
    
    @Test
    @DisplayName("Should include list price when available for savings calculation")
    void shouldIncludeListPriceWhenAvailable() {
        // Given - product "prod-004" has list price
        QuoteRequest request = new QuoteRequest(
                "cart-999",
                List.of(new QuoteRequest.QuoteItem("prod-004", 1))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then
        CartItem item = response.items().get(0);
        assertThat(item.listPrice()).isNotNull();
        assertThat(item.listPrice().amount()).isGreaterThan(item.price().amount());
    }
    
    @Test
    @DisplayName("Should clip quantity to available stock")
    void shouldClipQuantityToAvailableStock() {
        // Given - product "prod-021" is out of stock (maxOrderable = 0)
        QuoteRequest request = new QuoteRequest(
                "cart-stock",
                List.of(new QuoteRequest.QuoteItem("prod-021", 5))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then - item should be removed from cart (out of stock)
        assertThat(response.items()).isEmpty();
        assertThat(response.computed().subtotal()).isEqualTo(new Money(0, "PLN"));
    }
    
    @Test
    @DisplayName("Should clip quantity to max orderable when requested exceeds limit")
    void shouldClipQuantityToMaxOrderable() {
        // Given - requesting quantity higher than maxOrderable
        // Most products have high maxOrderable, using prod-001
        QuoteRequest request = new QuoteRequest(
                "cart-max",
                List.of(new QuoteRequest.QuoteItem("prod-001", 1000))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then - quantity should be clipped to maxOrderable or maxQty (whichever is lower)
        CartItem item = response.items().get(0);
        assertThat(item.quantity()).isLessThanOrEqualTo(99); // Default maxQty is 99
    }
    
    @Test
    @DisplayName("Should respect product min quantity constraint")
    void shouldRespectProductMinQuantity() {
        // Given - product with minQty constraint
        QuoteRequest request = new QuoteRequest(
                "cart-min",
                List.of(new QuoteRequest.QuoteItem("prod-001", 1))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then - quantity should be at least minQty (or default 1)
        CartItem item = response.items().get(0);
        assertThat(item.quantity()).isGreaterThanOrEqualTo(1);
    }
    
    @Test
    @DisplayName("Should handle batch query efficiently for multiple products")
    void shouldHandleBatchQueryEfficientlyForMultipleProducts() {
        // Given - request with many products
        QuoteRequest request = new QuoteRequest(
                "cart-batch",
                List.of(
                        new QuoteRequest.QuoteItem("prod-001", 1),
                        new QuoteRequest.QuoteItem("prod-002", 1),
                        new QuoteRequest.QuoteItem("prod-003", 1),
                        new QuoteRequest.QuoteItem("prod-004", 1),
                        new QuoteRequest.QuoteItem("prod-005", 1)
                )
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then - all items should be present
        assertThat(response.items()).hasSize(5);
        assertThat(response.computed().subtotal().amount()).isPositive();
    }
    
    @Test
    @DisplayName("Should throw exception for null request")
    void shouldThrowExceptionForNullRequest() {
        // When/Then
        assertThatThrownBy(() -> cartRepository.calculateQuote(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Quote request cannot be null");
    }
    
    @Test
    @DisplayName("Should throw exception for non-existent product")
    void shouldThrowExceptionForNonExistentProduct() {
        // Given
        QuoteRequest request = new QuoteRequest(
                "cart-invalid",
                List.of(new QuoteRequest.QuoteItem("non-existent-product", 1))
        );
        
        // When/Then
        assertThatThrownBy(() -> cartRepository.calculateQuote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Product not found");
    }
    
    @Test
    @DisplayName("Should calculate correct subtotal with multiple quantities")
    void shouldCalculateCorrectSubtotalWithMultipleQuantities() {
        // Given - single product with multiple quantity
        QuoteRequest request = new QuoteRequest(
                "cart-qty",
                List.of(new QuoteRequest.QuoteItem("prod-001", 3))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then
        CartItem item = response.items().get(0);
        Money expectedLineTotal = CartCalculations.calculateLineTotal(item);
        assertThat(response.computed().subtotal()).isEqualTo(expectedLineTotal);
    }
    
    @Test
    @DisplayName("Should return zero delivery cost by default")
    void shouldReturnZeroDeliveryCostByDefault() {
        // Given
        QuoteRequest request = new QuoteRequest(
                "cart-delivery",
                List.of(new QuoteRequest.QuoteItem("prod-001", 1))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then
        assertThat(response.computed().delivery()).isEqualTo(new Money(0, "PLN"));
    }
    
    @Test
    @DisplayName("Should generate unique item IDs for each cart item")
    void shouldGenerateUniqueItemIdsForEachCartItem() {
        // Given
        QuoteRequest request = new QuoteRequest(
                "cart-unique",
                List.of(
                        new QuoteRequest.QuoteItem("prod-001", 1),
                        new QuoteRequest.QuoteItem("prod-002", 1),
                        new QuoteRequest.QuoteItem("prod-003", 1)
                )
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then - all item IDs should be unique
        List<String> itemIds = response.items().stream()
                .map(CartItem::itemId)
                .toList();
        assertThat(itemIds).doesNotHaveDuplicates();
        assertThat(itemIds).allMatch(id -> id != null && !id.isBlank());
    }
    
    @Test
    @DisplayName("Should maintain cart ID from request in response")
    void shouldMaintainCartIdFromRequestInResponse() {
        // Given
        String cartId = "my-special-cart-id-12345";
        QuoteRequest request = new QuoteRequest(
                cartId,
                List.of(new QuoteRequest.QuoteItem("prod-001", 1))
        );
        
        // When
        QuoteResponse response = cartRepository.calculateQuote(request);
        
        // Then
        assertThat(response.cartId()).isEqualTo(cartId);
    }
}
