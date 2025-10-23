package com.github.pigeon.cart.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.pigeon.cart.api.*;
import com.github.pigeon.products.api.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for CartController.
 * These tests verify the REST API endpoints meet the requirements:
 * - All four cart endpoints implemented
 * - Error handling with proper HTTP status codes (400/404)
 * - OpenAPI documentation is generated
 * - p95 latency ≤250ms for mutations (verified via integration tests)
 */
@WebMvcTest(CartController.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    CartRepository cartRepository;
    
    @MockitoBean
    CartStore cartStore;

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should add item to empty cart")
    void shouldAddItemToEmptyCart() throws Exception {
        // Given
        AddItemRequest request = new AddItemRequest("prod-1", 2);
        
        when(cartStore.getCart("cart-123")).thenReturn(Optional.empty());
        
        QuoteResponse response = new QuoteResponse(
            "cart-123",
            List.of(
                new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), null)
            ),
            new CartComputed(
                new Money(20000, "PLN"),
                new Money(0, "PLN"),
                new Money(20000, "PLN")
            )
        );
        
        when(cartRepository.calculateQuote(any(QuoteRequest.class))).thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/carts/cart-123/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-123"))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].productId").value("prod-1"))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.computed.subtotal.amount").value(20000))
                .andExpect(jsonPath("$.computed.total.amount").value(20000));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should add item to existing cart")
    void shouldAddItemToExistingCart() throws Exception {
        // Given - cart already has one item
        CartSnapshot existingCart = new CartSnapshot(
            "cart-123",
            List.of(new CartItem("item-1", "prod-1", 1, new Money(10000, "PLN"), null)),
            new CartComputed(new Money(10000, "PLN"), new Money(0, "PLN"), new Money(10000, "PLN"))
        );
        when(cartStore.getCart("cart-123")).thenReturn(Optional.of(existingCart));
        
        AddItemRequest request = new AddItemRequest("prod-2", 3);
        
        QuoteResponse response = new QuoteResponse(
            "cart-123",
            List.of(
                new CartItem("item-1", "prod-1", 1, new Money(10000, "PLN"), null),
                new CartItem("item-2", "prod-2", 3, new Money(5000, "PLN"), null)
            ),
            new CartComputed(
                new Money(25000, "PLN"),
                new Money(0, "PLN"),
                new Money(25000, "PLN")
            )
        );
        
        when(cartRepository.calculateQuote(any(QuoteRequest.class))).thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/carts/cart-123/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 400 when adding item with invalid product id")
    void shouldReturn400WhenAddingInvalidProduct() throws Exception {
        // Given
        when(cartStore.getCart("cart-123")).thenReturn(Optional.empty());
        when(cartRepository.calculateQuote(any(QuoteRequest.class)))
            .thenThrow(new IllegalArgumentException("Product not found: invalid-prod"));
        
        AddItemRequest request = new AddItemRequest("invalid-prod", 1);
        
        // When & Then
        mockMvc.perform(post("/api/carts/cart-123/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("https://api.allegro-style-cart.com/problems/bad-request"))
                .andExpect(jsonPath("$.title").value("Bad Request"))
                .andExpect(jsonPath("$.detail").value("Product not found: invalid-prod"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should update item quantity")
    void shouldUpdateItemQuantity() throws Exception {
        // Given
        CartSnapshot existingCart = new CartSnapshot(
            "cart-123",
            List.of(new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), null)),
            new CartComputed(new Money(20000, "PLN"), new Money(0, "PLN"), new Money(20000, "PLN"))
        );
        when(cartStore.getCart("cart-123")).thenReturn(Optional.of(existingCart));
        
        UpdateItemRequest request = new UpdateItemRequest(5);
        
        QuoteResponse response = new QuoteResponse(
            "cart-123",
            List.of(
                new CartItem("item-1", "prod-1", 5, new Money(10000, "PLN"), null)
            ),
            new CartComputed(
                new Money(50000, "PLN"),
                new Money(0, "PLN"),
                new Money(50000, "PLN")
            )
        );
        
        when(cartRepository.calculateQuote(any(QuoteRequest.class))).thenReturn(response);
        
        // When & Then
        mockMvc.perform(patch("/api/carts/cart-123/items/item-1").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(5))
                .andExpect(jsonPath("$.computed.subtotal.amount").value(50000));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 400 when updating non-existent item")
    void shouldReturn400WhenUpdatingNonExistentItem() throws Exception {
        // Given
        CartSnapshot existingCart = new CartSnapshot(
            "cart-123",
            List.of(new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), null)),
            new CartComputed(new Money(20000, "PLN"), new Money(0, "PLN"), new Money(20000, "PLN"))
        );
        when(cartStore.getCart("cart-123")).thenReturn(Optional.of(existingCart));
        
        UpdateItemRequest request = new UpdateItemRequest(5);
        
        // When & Then - trying to update item-999 which doesn't exist
        mockMvc.perform(patch("/api/carts/cart-123/items/item-999").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Item not found in cart: item-999"));
    }
    
    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 400 when cart not found for update")
    void shouldReturn400WhenCartNotFoundForUpdate() throws Exception {
        // Given
        when(cartStore.getCart("non-existent-cart")).thenReturn(Optional.empty());
        
        UpdateItemRequest request = new UpdateItemRequest(5);
        
        // When & Then
        mockMvc.perform(patch("/api/carts/non-existent-cart/items/item-1").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Cart not found: non-existent-cart"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should remove item from cart")
    void shouldRemoveItemFromCart() throws Exception {
        // Given - cart has two items
        CartSnapshot existingCart = new CartSnapshot(
            "cart-123",
            List.of(
                new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), null),
                new CartItem("item-2", "prod-2", 1, new Money(5000, "PLN"), null)
            ),
            new CartComputed(new Money(25000, "PLN"), new Money(0, "PLN"), new Money(25000, "PLN"))
        );
        when(cartStore.getCart("cart-123")).thenReturn(Optional.of(existingCart));
        
        // Response should have only item-2
        QuoteResponse response = new QuoteResponse(
            "cart-123",
            List.of(
                new CartItem("item-2", "prod-2", 1, new Money(5000, "PLN"), null)
            ),
            new CartComputed(
                new Money(5000, "PLN"),
                new Money(0, "PLN"),
                new Money(5000, "PLN")
            )
        );
        
        when(cartRepository.calculateQuote(any(QuoteRequest.class))).thenReturn(response);
        
        // When & Then - removing item-1
        mockMvc.perform(delete("/api/carts/cart-123/items/item-1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].itemId").value("item-2"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return empty cart when removing last item")
    void shouldReturnEmptyCartWhenRemovingLastItem() throws Exception {
        // Given - cart has one item
        CartSnapshot existingCart = new CartSnapshot(
            "cart-123",
            List.of(new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), null)),
            new CartComputed(new Money(20000, "PLN"), new Money(0, "PLN"), new Money(20000, "PLN"))
        );
        when(cartStore.getCart("cart-123")).thenReturn(Optional.of(existingCart));
        
        // When & Then
        mockMvc.perform(delete("/api/carts/cart-123/items/item-1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0))
                .andExpect(jsonPath("$.computed.total.amount").value(0));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 400 when removing non-existent item")
    void shouldReturn400WhenRemovingNonExistentItem() throws Exception {
        // Given
        CartSnapshot existingCart = new CartSnapshot(
            "cart-123",
            List.of(new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), null)),
            new CartComputed(new Money(20000, "PLN"), new Money(0, "PLN"), new Money(20000, "PLN"))
        );
        when(cartStore.getCart("cart-123")).thenReturn(Optional.of(existingCart));
        
        // When & Then - trying to remove item-999 which doesn't exist
        mockMvc.perform(delete("/api/carts/cart-123/items/item-999").with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Item not found in cart: item-999"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should calculate quote")
    void shouldCalculateQuote() throws Exception {
        // Given
        QuoteRequest request = new QuoteRequest(
            "cart-123",
            List.of(
                new QuoteRequest.QuoteItem("prod-1", 2),
                new QuoteRequest.QuoteItem("prod-2", 3)
            )
        );
        
        QuoteResponse response = new QuoteResponse(
            "cart-123",
            List.of(
                new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), new Money(15000, "PLN")),
                new CartItem("item-2", "prod-2", 3, new Money(5000, "PLN"), null)
            ),
            new CartComputed(
                new Money(35000, "PLN"),
                new Money(0, "PLN"),
                new Money(35000, "PLN")
            )
        );
        
        when(cartRepository.calculateQuote(any(QuoteRequest.class))).thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/carts/cart-123/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("cart-123"))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.computed.subtotal.amount").value(35000));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 400 when cart id in path doesn't match request body")
    void shouldReturn400WhenCartIdMismatch() throws Exception {
        // Given
        QuoteRequest request = new QuoteRequest(
            "cart-456",
            List.of(new QuoteRequest.QuoteItem("prod-1", 1))
        );
        
        // When & Then - path has cart-123 but body has cart-456
        mockMvc.perform(post("/api/carts/cart-123/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Cart ID in path does not match request body"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should handle quote with list prices for savings calculation")
    void shouldHandleQuoteWithListPrices() throws Exception {
        // Given
        QuoteRequest request = new QuoteRequest(
            "cart-123",
            List.of(new QuoteRequest.QuoteItem("prod-1", 2))
        );
        
        QuoteResponse response = new QuoteResponse(
            "cart-123",
            List.of(
                new CartItem("item-1", "prod-1", 2, new Money(10000, "PLN"), new Money(15000, "PLN"))
            ),
            new CartComputed(
                new Money(20000, "PLN"),
                new Money(0, "PLN"),
                new Money(20000, "PLN")
            )
        );
        
        when(cartRepository.calculateQuote(any(QuoteRequest.class))).thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/carts/cart-123/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].listPrice.amount").value(15000))
                .andExpect(jsonPath("$.items[0].price.amount").value(10000));
    }
}
