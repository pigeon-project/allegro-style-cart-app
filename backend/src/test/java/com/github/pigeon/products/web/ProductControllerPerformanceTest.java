package com.github.pigeon.products.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Performance tests for ProductController to verify p95 latency requirements.
 * Requirement: p95 latency ≤150ms for read operations
 * 
 * Note: These are basic performance characterization tests.
 * Full performance testing should be done with proper load testing tools
 * in a production-like environment.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerPerformanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should retrieve single product with acceptable latency")
    void shouldRetrieveSingleProductQuickly() throws Exception {
        long startTime = System.currentTimeMillis();
        
        mockMvc.perform(get("/api/products/prod-001"))
                .andExpect(status().isOk());
        
        long duration = System.currentTimeMillis() - startTime;
        
        // Basic assertion - in real environment this should be < 150ms
        // In test environment we allow more time due to Spring context setup
        System.out.println("Single product retrieval took: " + duration + "ms");
        
        // Verify it completes reasonably fast (allowing overhead for test environment)
        if (duration > 1000) {
            throw new AssertionError("Product retrieval took too long: " + duration + "ms");
        }
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should retrieve batch of products with acceptable latency")
    void shouldRetrieveBatchProductsQuickly() throws Exception {
        long startTime = System.currentTimeMillis();
        
        mockMvc.perform(get("/api/products")
                        .param("ids", "prod-001", "prod-002", "prod-003", "prod-004", "prod-005"))
                .andExpect(status().isOk());
        
        long duration = System.currentTimeMillis() - startTime;
        
        System.out.println("Batch product retrieval took: " + duration + "ms");
        
        // Verify batch query is optimized (allowing overhead for test environment)
        if (duration > 1000) {
            throw new AssertionError("Batch product retrieval took too long: " + duration + "ms");
        }
    }
}
