package com.github.pigeon.web;

import com.github.pigeon.web.exceptions.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.github.pigeon.cart.api.CartRepository;
import com.github.pigeon.cart.api.CartStore;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartRepository cartRepository;

    @MockitoBean
    private CartStore cartStore;

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should return RFC 7807 Problem Detail for 404 errors")
    void shouldReturnProblemDetailFor404() throws Exception {
        mockMvc.perform(get("/api/products/non-existent-product-id"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value(containsString("not-found")))
                .andExpect(jsonPath("$.title").value("Resource Not Found"))
                .andExpect(jsonPath("$.detail").value(containsString("Product not found")));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should return 200 OK for valid product request")
    void shouldReturn200ForValidProduct() throws Exception {
        mockMvc.perform(get("/api/products/prod-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("prod-001"));
    }

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should return 200 OK for batch query even with non-existent IDs")
    void shouldReturn200ForBatchQuery() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("ids", "prod-001", "non-existent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 400 with Problem Detail for validation errors")
    void shouldReturnValidationError() throws Exception {
        String invalidRequest = """
            {
                "productId": "",
                "quantity": 0
            }
            """;

        mockMvc.perform(post("/api/carts/cart-123/items").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Bad Request"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 422 for domain validation errors")
    void shouldReturnDomainValidationError() throws Exception {
        when(cartRepository.calculateQuote(any()))
                .thenThrow(new DomainValidationException("Invalid cart state"));

        String request = """
            {
                "cartId": "cart-123",
                "items": []
            }
            """;

        mockMvc.perform(post("/api/carts/cart-123/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value(containsString("domain-validation")))
                .andExpect(jsonPath("$.title").value("Domain Validation Failed"))
                .andExpect(jsonPath("$.detail").value("Invalid cart state"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 409 for conflict errors")
    void shouldReturnConflictError() throws Exception {
        when(cartRepository.calculateQuote(any()))
                .thenThrow(new ConflictException("Concurrent modification detected"));

        String request = """
            {
                "cartId": "cart-123",
                "items": []
            }
            """;

        mockMvc.perform(post("/api/carts/cart-123/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value(containsString("conflict")))
                .andExpect(jsonPath("$.title").value("Conflict"))
                .andExpect(jsonPath("$.detail").value("Concurrent modification detected"));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should return 500 without stack trace for internal errors")
    void shouldReturnInternalServerErrorWithoutStackTrace() throws Exception {
        when(cartRepository.calculateQuote(any()))
                .thenThrow(new RuntimeException("Database connection failed"));

        String request = """
            {
                "cartId": "cart-123",
                "items": []
            }
            """;

        mockMvc.perform(post("/api/carts/cart-123/quote").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value(containsString("internal-error")))
                .andExpect(jsonPath("$.title").value("Internal Server Error"))
                .andExpect(jsonPath("$.detail").value("An unexpected error occurred"))
                // Ensure no stack trace is present
                .andExpect(jsonPath("$.stackTrace").doesNotExist())
                .andExpect(jsonPath("$.trace").doesNotExist());
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should include rate limit headers in responses")
    void shouldIncludeRateLimitHeaders() throws Exception {
        mockMvc.perform(get("/api/products/prod-001"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-RateLimit-Limit"))
                .andExpect(header().exists("X-RateLimit-Remaining"))
                .andExpect(header().exists("X-RateLimit-Reset"));
    }
}
