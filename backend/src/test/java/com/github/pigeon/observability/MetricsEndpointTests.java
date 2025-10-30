package com.github.pigeon.observability;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MetricsEndpointTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should expose metrics endpoint")
    void shouldExposeMetricsEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.names").isArray());
    }

    @Test
    @DisplayName("Should expose JVM memory metrics")
    void shouldExposeJvmMemoryMetrics() throws Exception {
        mockMvc.perform(get("/actuator/metrics/jvm.memory.used"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("jvm.memory.used"))
                .andExpect(jsonPath("$.measurements").isArray());
    }

    @Test
    @DisplayName("Should expose system CPU usage metrics")
    void shouldExposeSystemCpuMetrics() throws Exception {
        mockMvc.perform(get("/actuator/metrics/system.cpu.usage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("system.cpu.usage"))
                .andExpect(jsonPath("$.measurements").isArray());
    }

    @Test
    @DisplayName("Should expose process CPU usage metrics")
    void shouldExposeProcessCpuMetrics() throws Exception {
        mockMvc.perform(get("/actuator/metrics/process.cpu.usage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("process.cpu.usage"))
                .andExpect(jsonPath("$.measurements").isArray());
    }

    @Test
    @DisplayName("Should track HTTP request metrics")
    void shouldTrackHttpRequestMetrics() throws Exception {
        // First make a request to generate metrics
        mockMvc.perform(get("/actuator/health"));
        
        // Then check if HTTP metrics are available
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.names").isArray())
                .andExpect(jsonPath("$.names[*]").value(org.hamcrest.Matchers.hasItem("http.server.requests")));
    }
}
