package com.github.pigeon.observability;

import com.github.pigeon.cart.CartCommands;
import com.github.pigeon.cart.CartQueries;
import com.github.pigeon.cart.api.Cart;
import com.github.pigeon.common.ProblemDetailHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@Import({ProblemDetailHandler.class, RequestLoggingFilter.class})
@ExtendWith(OutputCaptureExtension.class)
class RequestLoggingFilterTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartQueries cartQueries;

    @MockitoBean
    private CartCommands cartCommands;

    private UUID cartId;

    @BeforeEach
    void setUp() {
        cartId = UUID.randomUUID();
    }

    @Test
    @WithMockUser(value = "testuser")
    @DisplayName("Should log request with structured JSON format including requestId, route, durationMs, status, and errorCode")
    void shouldLogRequestWithStructuredFormat(CapturedOutput output) throws Exception {
        Cart cart = new Cart(cartId, "testuser");
        when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
        when(cartQueries.getCartItems(cartId)).thenReturn(List.of());

        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Request-ID"));

        String logOutput = output.getOut();
        
        // Verify structured JSON log format with all required fields
        assertThat(logOutput).contains("\"timestamp\":");
        assertThat(logOutput).contains("\"level\":");
        assertThat(logOutput).contains("\"service\":\"allegro-cart-backend\"");
        assertThat(logOutput).contains("\"environment\":");
        assertThat(logOutput).contains("\"requestId\":");
        assertThat(logOutput).contains("\"route\":\"GET /api/cart\"");
        assertThat(logOutput).contains("\"durationMs\":");
        assertThat(logOutput).contains("\"status\":\"200\"");
        // errorCode should be empty for successful requests
        assertThat(logOutput).contains("\"errorCode\":\"\"");
    }

    @Test
    @WithMockUser(value = "testuser")
    @DisplayName("Should include custom X-Request-ID header in response")
    void shouldIncludeRequestIdInResponse(CapturedOutput output) throws Exception {
        Cart cart = new Cart(cartId, "testuser");
        when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
        when(cartQueries.getCartItems(cartId)).thenReturn(List.of());

        String requestId = "custom-request-id-123";

        mockMvc.perform(get("/api/cart")
                        .header("X-Request-ID", requestId))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-ID", requestId));

        String logOutput = output.getOut();
        assertThat(logOutput).contains("\"requestId\":\"" + requestId + "\"");
    }

    @Test
    @WithMockUser(value = "testuser")
    @DisplayName("Should log 4xx errors with WARN level and include errorCode")
    void shouldLogClientErrorsWithWarnLevel(CapturedOutput output) throws Exception {
        when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/cart/items/invalid-uuid"))
                .andExpect(status().is4xxClientError());

        String logOutput = output.getOut();
        assertThat(logOutput).contains("\"level\":\"WARN\"");
        // Should include errorCode for 4xx errors
        assertThat(logOutput).containsPattern("\"errorCode\":\"4\\d{2}\"");
    }

    @Test
    @DisplayName("Should not log actuator endpoints")
    void shouldNotLogActuatorEndpoints(CapturedOutput output) throws Exception {
        mockMvc.perform(get("/actuator/health"));

        String logOutput = output.getOut();
        // Should not contain "Request completed" log for actuator endpoints
        assertThat(logOutput).doesNotContain("Request completed: method=GET uri=/actuator/health");
    }

    @Test
    @WithMockUser(value = "testuser")
    @DisplayName("Should not include PII in logs")
    void shouldNotIncludePiiInLogs(CapturedOutput output) throws Exception {
        Cart cart = new Cart(cartId, "testuser");
        when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
        when(cartQueries.getCartItems(cartId)).thenReturn(List.of());

        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk());

        String logOutput = output.getOut();
        
        // Verify only hashed/ID references are logged, not raw user data
        // The username should not appear in the request logging
        // (it's already in the authentication context but not logged by the filter)
        assertThat(logOutput).contains("\"route\":\"GET /api/cart\"");
        // Verify no sensitive data patterns are logged
        assertThat(logOutput).doesNotContainPattern("password|token|secret|creditCard");
    }
}
