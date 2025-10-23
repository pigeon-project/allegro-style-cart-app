package com.github.pigeon.products;

import com.github.pigeon.products.api.Product;
import com.github.pigeon.products.api.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Tests to verify batch query optimization and no N+1 problem.
 */
@SpringBootTest
class ProductRepositoryBatchQueryTest {

    @Autowired
    private ProductRepository productRepository;

    @MockitoSpyBean
    private PersistedProductRepository persistedProductRepository;

    @Test
    @DisplayName("Should fetch multiple products with single query (no N+1)")
    void shouldFetchMultipleProductsWithSingleQuery() {
        // Given
        List<String> productIds = List.of("prod-001", "prod-002", "prod-003", "prod-004", "prod-005");

        // When
        List<Product> products = productRepository.findByIds(productIds);

        // Then
        assertThat(products).hasSize(5);
        assertThat(products).extracting(Product::id)
                .containsExactlyInAnyOrder("prod-001", "prod-002", "prod-003", "prod-004", "prod-005");

        // Verify that findByIdIn was called exactly once (single batch query)
        verify(persistedProductRepository, times(1)).findByIdIn(anyList());
    }

    @Test
    @DisplayName("Should handle large batch of product IDs efficiently")
    void shouldHandleLargeBatchEfficiently() {
        // Given - request 20 products
        List<String> productIds = List.of(
                "prod-001", "prod-002", "prod-003", "prod-004", "prod-005",
                "prod-006", "prod-007", "prod-008", "prod-009", "prod-010",
                "prod-011", "prod-012", "prod-013", "prod-014", "prod-015",
                "prod-016", "prod-017", "prod-018", "prod-019", "prod-020"
        );

        // When
        List<Product> products = productRepository.findByIds(productIds);

        // Then
        assertThat(products).hasSize(20);

        // Verify that findByIdIn was called exactly once (single batch query)
        verify(persistedProductRepository, times(1)).findByIdIn(anyList());
    }

    @Test
    @DisplayName("Should return empty list when no products match IDs")
    void shouldReturnEmptyListWhenNoProductsMatch() {
        // Given
        List<String> nonExistentIds = List.of("non-exist-1", "non-exist-2", "non-exist-3");

        // When
        List<Product> products = productRepository.findByIds(nonExistentIds);

        // Then
        assertThat(products).isEmpty();

        // Verify that findByIdIn was still called exactly once
        verify(persistedProductRepository, times(1)).findByIdIn(anyList());
    }
}
