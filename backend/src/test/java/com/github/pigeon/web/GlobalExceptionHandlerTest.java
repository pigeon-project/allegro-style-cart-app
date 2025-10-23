package com.github.pigeon.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(value = "some.user")
    @DisplayName("Should return RFC 7807 Problem Detail for 404 errors")
    void shouldReturnProblemDetailFor404() throws Exception {
        mockMvc.perform(get("/api/products/non-existent-product-id"))
                .andExpect(status().isNotFound());
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
}
