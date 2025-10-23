package com.github.pigeon.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ActuatorEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should expose health endpoint")
    void shouldExposeHealthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should expose metrics endpoint")
    void shouldExposeMetricsEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should expose Prometheus metrics endpoint")
    void shouldExposePrometheusEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should expose info endpoint")
    void shouldExposeInfoEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(value = "test.user")
    @DisplayName("Should expose HTTP server requests metrics")
    void shouldExposeHttpServerRequestsMetrics() throws Exception {
        // First make a request to generate metrics
        mockMvc.perform(get("/api/products/prod-001"))
                .andExpect(status().isOk());

        // Then verify the metrics endpoint has http.server.requests
        mockMvc.perform(get("/actuator/metrics/http.server.requests"))
                .andExpect(status().isOk());
    }
}
