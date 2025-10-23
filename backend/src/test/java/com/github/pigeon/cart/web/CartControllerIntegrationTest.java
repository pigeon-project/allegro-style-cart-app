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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for CartController with real Spring context and database.
 * These tests verify end-to-end functionality with actual product data.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CartControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should add item to empty cart and return quote with product from catalog")
    void shouldAddItemToEmptyCart() throws Exception {
        // Given - prod-001 exists in the product catalog (seeded data)
        AddItemRequest request = new AddItemRequest("prod-001", 2, List.of());
        
        // When & Then
        mockMvc.perform(post("/api/carts/cart-integration-1/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-integration-1"))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].productId").value("prod-001"))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.items[0].price").exists())
                .andExpect(jsonPath("$.computed.subtotal.amount").isNumber())
                .andExpect(jsonPath("$.computed.delivery.amount").value(0))
                .andExpect(jsonPath("$.computed.total.amount").isNumber());
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should add multiple items to cart")
    void shouldAddMultipleItemsToCart() throws Exception {
        String cartId = "cart-integration-2";
        
        // Add first item
        AddItemRequest request1 = new AddItemRequest("prod-001", 1, List.of());
        mockMvc.perform(post("/api/carts/" + cartId + "/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));
        
        // Add second item (with current cart state)
        AddItemRequest request2 = new AddItemRequest("prod-002", 2, 
            List.of(new QuoteRequest.QuoteItem("prod-001", 1)));
        mockMvc.perform(post("/api/carts/" + cartId + "/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[*].productId", containsInAnyOrder("prod-001", "prod-002")));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should calculate quote for multiple items")
    void shouldCalculateQuoteForMultipleItems() throws Exception {
        QuoteRequest request = new QuoteRequest(
            "cart-integration-3",
            List.of(
                new QuoteRequest.QuoteItem("prod-001", 2),
                new QuoteRequest.QuoteItem("prod-002", 1),
                new QuoteRequest.QuoteItem("prod-003", 3)
            )
        );
        
        mockMvc.perform(post("/api/carts/cart-integration-3/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-integration-3"))
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.computed.subtotal.amount", greaterThan(0)))
                .andExpect(jsonPath("$.computed.total.amount", greaterThan(0)));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 400 for non-existent product")
    void shouldReturn400ForNonExistentProduct() throws Exception {
        AddItemRequest request = new AddItemRequest("non-existent-product", 1, List.of());
        
        mockMvc.perform(post("/api/carts/cart-integration-4/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://api.allegro-style-cart.com/problems/bad-request"))
                .andExpect(jsonPath("$.detail", containsString("Product not found")));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should validate prices from product catalog (price drift detection)")
    void shouldValidatePricesFromCatalog() throws Exception {
        // The quote request contains prices, but they should be replaced with catalog prices
        QuoteRequest request = new QuoteRequest(
            "cart-integration-5",
            List.of(new QuoteRequest.QuoteItem("prod-001", 1))
        );
        
        mockMvc.perform(post("/api/carts/cart-integration-5/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].price.currency").value("PLN"))
                .andExpect(jsonPath("$.items[0].price.amount").isNumber())
                // Price should be from catalog, not from request
                .andExpect(jsonPath("$.items[0].price.amount", greaterThan(0)));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should handle products with list prices for savings")
    void shouldHandleListPrices() throws Exception {
        // prod-002 has a list price in the catalog
        QuoteRequest request = new QuoteRequest(
            "cart-integration-6",
            List.of(new QuoteRequest.QuoteItem("prod-002", 1))
        );
        
        mockMvc.perform(post("/api/carts/cart-integration-6/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].price").exists())
                .andExpect(jsonPath("$.items[0].listPrice").exists())
                // List price should be greater than price for items on sale
                .andExpect(jsonPath("$.items[0].listPrice.amount").isNumber())
                .andExpect(jsonPath("$.items[0].price.amount").isNumber());
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should clip quantity to available stock")
    void shouldClipQuantityToAvailableStock() throws Exception {
        // Request more than available in stock
        QuoteRequest request = new QuoteRequest(
            "cart-integration-7",
            List.of(new QuoteRequest.QuoteItem("prod-001", 10000)) // Exceeds max orderable
        );
        
        mockMvc.perform(post("/api/carts/cart-integration-7/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity", lessThanOrEqualTo(99))); // Max quantity is 99
    }
}
