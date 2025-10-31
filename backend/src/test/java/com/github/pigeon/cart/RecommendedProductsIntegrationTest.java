package com.github.pigeon.cart;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test for adding products from the "Recommended Products" carousel.
 * This test verifies the complete flow of adding items to the cart with real sellers
 * from the database that match the frontend mock products.
 */
@SpringBootTest
@AutoConfigureMockMvc
class RecommendedProductsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(value = "testuser")
    @DisplayName("Should add product from recommended carousel with real seller ID")
    void shouldAddProductFromRecommendedCarousel() throws Exception {
        // This test uses the same seller ID and product data as in the frontend
        // mockProducts.ts file (prod-1)
        String sellerId = "550e8400-e29b-41d4-a716-446655440001";
        String productImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";
        String productTitle = "Premium Wireless Headphones with Noise Cancellation";
        String pricePerUnit = "299.99";

        String requestBody = """
                {
                    "sellerId": "%s",
                    "productImage": "%s",
                    "productTitle": "%s",
                    "pricePerUnit": %s,
                    "quantity": 1
                }
                """.formatted(sellerId, productImage, productTitle, pricePerUnit);

        // Add item to cart
        mockMvc.perform(post("/api/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"));

        // Verify item was added by fetching the cart
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].productTitle").value(productTitle))
                .andExpect(jsonPath("$.items[0].pricePerUnit").value(299.99))
                .andExpect(jsonPath("$.items[0].quantity").value(1))
                .andExpect(jsonPath("$.items[0].productImage").value(productImage))
                .andExpect(jsonPath("$.items[0].sellerId").value(sellerId));
    }

    @Test
    @WithMockUser(value = "testuser2")
    @DisplayName("Should add multiple products from different sellers")
    void shouldAddMultipleProductsFromDifferentSellers() throws Exception {
        // Add product from seller 1 (Premium Electronics Store)
        String requestBody1 = """
                {
                    "sellerId": "550e8400-e29b-41d4-a716-446655440001",
                    "productImage": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
                    "productTitle": "Premium Wireless Headphones with Noise Cancellation",
                    "pricePerUnit": 299.99,
                    "quantity": 1
                }
                """;

        mockMvc.perform(post("/api/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody1))
                .andExpect(status().isCreated());

        // Add product from seller 2 (Smart Tech Gadgets)
        String requestBody2 = """
                {
                    "sellerId": "550e8400-e29b-41d4-a716-446655440002",
                    "productImage": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
                    "productTitle": "Smart Watch with Health Monitoring",
                    "pricePerUnit": 199.99,
                    "quantity": 1
                }
                """;

        mockMvc.perform(post("/api/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody2))
                .andExpect(status().isCreated());

        // Add product from seller 3 (Fashion & Accessories)
        String requestBody3 = """
                {
                    "sellerId": "550e8400-e29b-41d4-a716-446655440003",
                    "productImage": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
                    "productTitle": "Designer Sunglasses UV Protection",
                    "pricePerUnit": 149.99,
                    "quantity": 1
                }
                """;

        mockMvc.perform(post("/api/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody3))
                .andExpect(status().isCreated());

        // Verify all items were added
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].sellerId").value("550e8400-e29b-41d4-a716-446655440001"))
                .andExpect(jsonPath("$.items[1].sellerId").value("550e8400-e29b-41d4-a716-446655440002"))
                .andExpect(jsonPath("$.items[2].sellerId").value("550e8400-e29b-41d4-a716-446655440003"));
    }

    @Test
    @WithMockUser(value = "testuser3")
    @DisplayName("Should handle product URLs with special characters in query parameters")
    void shouldHandleProductUrlsWithQueryParameters() throws Exception {
        // Test with URL containing ?, &, = characters
        String requestBody = """
                {
                    "sellerId": "550e8400-e29b-41d4-a716-446655440004",
                    "productImage": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
                    "productTitle": "Portable Bluetooth Speaker",
                    "pricePerUnit": 79.99,
                    "quantity": 1
                }
                """;

        mockMvc.perform(post("/api/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated());

        // Verify item was added correctly with the URL
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productImage")
                        .value("https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop"));
    }
}
