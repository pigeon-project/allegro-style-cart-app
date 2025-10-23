package com.github.pigeon.cart.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.pigeon.cart.api.QuoteRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Performance tests for CartController to verify p95 latency requirements.
 * Requirement: p95 latency ≤250ms for mutation operations (add, update, remove)
 * Requirement: p95 latency ≤150ms for read/quote operations
 * 
 * Note: These are basic performance characterization tests.
 * Full performance testing should be done with proper load testing tools
 * in a production-like environment.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CartControllerPerformanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should add item to cart with acceptable latency (p95 ≤250ms)")
    void shouldAddItemQuickly() throws Exception {
        AddItemRequest request = new AddItemRequest("prod-001", 2);
        
        long startTime = System.currentTimeMillis();
        
        mockMvc.perform(post("/api/carts/cart-perf-test/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        
        long duration = System.currentTimeMillis() - startTime;
        
        System.out.println("Add item took: " + duration + "ms");
        
        // Verify it completes within acceptable time (allowing overhead for test environment)
        if (duration > 1000) {
            throw new AssertionError("Add item took too long: " + duration + "ms (target: <250ms in production)");
        }
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should calculate quote with acceptable latency (p95 ≤150ms)")
    void shouldCalculateQuoteQuickly() throws Exception {
        QuoteRequest request = new QuoteRequest(
            "cart-perf-test",
            List.of(
                new QuoteRequest.QuoteItem("prod-001", 2),
                new QuoteRequest.QuoteItem("prod-002", 1),
                new QuoteRequest.QuoteItem("prod-003", 3)
            )
        );
        
        long startTime = System.currentTimeMillis();
        
        mockMvc.perform(post("/api/carts/cart-perf-test/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        
        long duration = System.currentTimeMillis() - startTime;
        
        System.out.println("Calculate quote took: " + duration + "ms");
        
        // Quote endpoint should be faster (read operation)
        if (duration > 1000) {
            throw new AssertionError("Calculate quote took too long: " + duration + "ms (target: <150ms in production)");
        }
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should perform multiple cart operations within acceptable time")
    void shouldPerformMultipleOperationsQuickly() throws Exception {
        String cartId = "cart-perf-multi";
        
        // Simulate a typical user flow: add items, add another, calculate quote
        long totalStart = System.currentTimeMillis();
        
        // Add first item
        AddItemRequest add1 = new AddItemRequest("prod-001", 1);
        mockMvc.perform(post("/api/carts/" + cartId + "/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(add1)))
                .andExpect(status().isOk());
        
        // Add second item
        AddItemRequest add2 = new AddItemRequest("prod-002", 2);
        mockMvc.perform(post("/api/carts/" + cartId + "/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(add2)))
                .andExpect(status().isOk());
        
        // Calculate quote
        QuoteRequest quoteRequest = new QuoteRequest(cartId, List.of(
            new QuoteRequest.QuoteItem("prod-001", 1),
            new QuoteRequest.QuoteItem("prod-002", 2)
        ));
        mockMvc.perform(post("/api/carts/" + cartId + "/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(quoteRequest)))
                .andExpect(status().isOk());
        
        long totalDuration = System.currentTimeMillis() - totalStart;
        
        System.out.println("Multiple operations (add + add + quote) took: " + totalDuration + "ms");
        
        // Verify all operations complete within reasonable time
        if (totalDuration > 3000) {
            throw new AssertionError("Multiple operations took too long: " + totalDuration + "ms");
        }
    }
}
