package com.github.pigeon.products.web;

import com.github.pigeon.products.ProductQueries;
import com.github.pigeon.products.api.Availability;
import com.github.pigeon.products.api.Money;
import com.github.pigeon.products.api.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    ProductQueries productQueries;

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should get product by id")
    void shouldGetProductById() throws Exception {
        Product product = new Product(
                "prod-123",
                "seller-456",
                "Test Seller",
                "Test Product",
                "https://example.com/image.jpg",
                null,
                new Money(10000, "PLN"),
                new Money(15000, "PLN"),
                "PLN",
                new Availability(true, 50),
                1,
                99
        );

        when(productQueries.getProduct("prod-123")).thenReturn(Optional.of(product));

        mockMvc.perform(get("/api/products/prod-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("prod-123"))
                .andExpect(jsonPath("$.sellerId").value("seller-456"))
                .andExpect(jsonPath("$.sellerName").value("Test Seller"))
                .andExpect(jsonPath("$.title").value("Test Product"))
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/image.jpg"))
                .andExpect(jsonPath("$.price.amount").value(10000))
                .andExpect(jsonPath("$.price.currency").value("PLN"))
                .andExpect(jsonPath("$.listPrice.amount").value(15000))
                .andExpect(jsonPath("$.currency").value("PLN"))
                .andExpect(jsonPath("$.availability.inStock").value(true))
                .andExpect(jsonPath("$.availability.maxOrderable").value(50))
                .andExpect(jsonPath("$.minQty").value(1))
                .andExpect(jsonPath("$.maxQty").value(99));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should return 404 when product not found")
    void shouldReturn404WhenProductNotFound() throws Exception {
        when(productQueries.getProduct("non-existent")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/products/non-existent"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should get products by ids")
    void shouldGetProductsByIds() throws Exception {
        Product product1 = new Product(
                "prod-1",
                "seller-1",
                "Seller One",
                "Product One",
                "https://example.com/1.jpg",
                null,
                new Money(5000, "PLN"),
                null,
                "PLN",
                new Availability(true, 10),
                null,
                null
        );

        Product product2 = new Product(
                "prod-2",
                "seller-2",
                "Seller Two",
                "Product Two",
                "https://example.com/2.jpg",
                null,
                new Money(8000, "PLN"),
                null,
                "PLN",
                new Availability(false, 0),
                null,
                null
        );

        when(productQueries.getProducts(List.of("prod-1", "prod-2")))
                .thenReturn(List.of(product1, product2));

        mockMvc.perform(get("/api/products")
                        .param("ids", "prod-1", "prod-2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("prod-1"))
                .andExpect(jsonPath("$[0].title").value("Product One"))
                .andExpect(jsonPath("$[1].id").value("prod-2"))
                .andExpect(jsonPath("$[1].title").value("Product Two"));
    }
}
