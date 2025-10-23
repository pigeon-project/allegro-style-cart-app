package com.github.pigeon.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RequestCorrelationFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should generate correlation ID when not provided")
    void shouldGenerateCorrelationIdWhenNotProvided() throws Exception {
        mockMvc.perform(get("/api/products/prod-001"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Correlation-ID"))
                .andExpect(header().string("X-Correlation-ID", matchesPattern("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$")));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should preserve correlation ID when provided")
    void shouldPreserveCorrelationIdWhenProvided() throws Exception {
        String correlationId = "test-correlation-id-12345";

        mockMvc.perform(get("/api/products/prod-001")
                        .header("X-Correlation-ID", correlationId))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Correlation-ID", correlationId));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should handle empty correlation ID header")
    void shouldHandleEmptyCorrelationIdHeader() throws Exception {
        mockMvc.perform(get("/api/products/prod-001")
                        .header("X-Correlation-ID", ""))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Correlation-ID"))
                .andExpect(header().string("X-Correlation-ID", matchesPattern("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$")));
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should include correlation ID in all responses including errors")
    void shouldIncludeCorrelationIdInErrorResponses() throws Exception {
        mockMvc.perform(get("/api/products/non-existent-id"))
                .andExpect(status().isNotFound())
                .andExpect(header().exists("X-Correlation-ID"))
                .andExpect(header().string("X-Correlation-ID", notNullValue()));
    }
}
