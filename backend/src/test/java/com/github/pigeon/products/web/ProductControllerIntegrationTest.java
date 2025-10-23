package com.github.pigeon.products.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should retrieve product by id from database")
    void shouldRetrieveProductById() throws Exception {
        mockMvc.perform(get("/api/products/prod-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("prod-001"))
                .andExpect(jsonPath("$.sellerId").value("seller-001"))
                .andExpect(jsonPath("$.sellerName").value("Electronics Plus"))
                .andExpect(jsonPath("$.title").value("Laptop Dell XPS 15"))
                .andExpect(jsonPath("$.imageUrl").exists())
                .andExpect(jsonPath("$.price.amount").value(599900))
                .andExpect(jsonPath("$.price.currency").value("PLN"))
                .andExpect(jsonPath("$.listPrice.amount").value(699900))
                .andExpect(jsonPath("$.currency").value("PLN"))
                .andExpect(jsonPath("$.availability.inStock").value(true))
                .andExpect(jsonPath("$.availability.maxOrderable").value(15))
                .andExpect(jsonPath("$.minQty").value(1))
                .andExpect(jsonPath("$.maxQty").value(5))
                .andExpect(jsonPath("$.attributes").isArray())
                .andExpect(jsonPath("$.attributes", hasSize(2)));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should return 404 for non-existent product")
    void shouldReturn404ForNonExistentProduct() throws Exception {
        mockMvc.perform(get("/api/products/non-existent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should retrieve multiple products by ids (batch query)")
    void shouldRetrieveMultipleProductsByIds() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("ids", "prod-001", "prod-002", "prod-003"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id").value("prod-001"))
                .andExpect(jsonPath("$[0].title").value("Laptop Dell XPS 15"))
                .andExpect(jsonPath("$[1].id").value("prod-002"))
                .andExpect(jsonPath("$[1].title").value("Wireless Mouse Logitech MX Master 3"))
                .andExpect(jsonPath("$[2].id").value("prod-003"))
                .andExpect(jsonPath("$[2].title").value("The Pragmatic Programmer"));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should retrieve products from multiple sellers (batch query)")
    void shouldRetrieveProductsFromMultipleSellers() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("ids", "prod-001", "prod-003", "prod-004"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].sellerId").value("seller-001"))
                .andExpect(jsonPath("$[1].sellerId").value("seller-002"))
                .andExpect(jsonPath("$[2].sellerId").value("seller-003"));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should return empty list for batch query with non-existent ids")
    void shouldReturnEmptyListForNonExistentIds() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("ids", "non-exist-1", "non-exist-2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should retrieve product with null listPrice")
    void shouldRetrieveProductWithNullListPrice() throws Exception {
        mockMvc.perform(get("/api/products/prod-003"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("prod-003"))
                .andExpect(jsonPath("$.title").value("The Pragmatic Programmer"))
                .andExpect(jsonPath("$.price.amount").value(12900))
                .andExpect(jsonPath("$.listPrice").doesNotExist());
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should retrieve out-of-stock product")
    void shouldRetrieveOutOfStockProduct() throws Exception {
        mockMvc.perform(get("/api/products/prod-021"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("prod-021"))
                .andExpect(jsonPath("$.availability.inStock").value(false))
                .andExpect(jsonPath("$.availability.maxOrderable").value(0));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should verify at least 30 products seeded by fetching them")
    void shouldVerifyAtLeast30ProductsSeeded() throws Exception {
        // Try to fetch multiple products to verify seeding worked
        mockMvc.perform(get("/api/products")
                        .param("ids", "prod-001", "prod-002", "prod-003", "prod-004", "prod-005",
                                "prod-006", "prod-007", "prod-008", "prod-009", "prod-010",
                                "prod-011", "prod-012", "prod-013", "prod-014", "prod-015",
                                "prod-016", "prod-017", "prod-018", "prod-019", "prod-020",
                                "prod-021", "prod-022", "prod-023", "prod-024", "prod-025",
                                "prod-026", "prod-027", "prod-028", "prod-029", "prod-030"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(30)));
    }
}
