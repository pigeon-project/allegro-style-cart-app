package com.github.pigeon.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    private Map<String, Bucket> rateLimitBuckets;
    private TestRateLimitProperties properties;
    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    void setUp() {
        rateLimitBuckets = new HashMap<>();
        properties = new TestRateLimitProperties(60, true);
        rateLimitFilter = new RateLimitFilter(rateLimitBuckets, properties);

        SecurityContextHolder.setContext(securityContext);
    }
    
    static class TestRateLimitProperties implements RateLimitProperties {
        private final int requestsPerMinute;
        private final boolean enabled;
        
        TestRateLimitProperties(int requestsPerMinute, boolean enabled) {
            this.requestsPerMinute = requestsPerMinute;
            this.enabled = enabled;
        }
        
        @Override
        public int getRequestsPerMinute() {
            return requestsPerMinute;
        }
        
        @Override
        public boolean isEnabled() {
            return enabled;
        }
        
        @Override
        public Bucket createBucket() {
            Bandwidth limit = Bandwidth.classic(
                    requestsPerMinute,
                    Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))
            );
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        }
    }

    @Test
    @DisplayName("Should allow request and add rate limit headers when within limit")
    void shouldAllowRequestWithinLimit() throws Exception {
        // Given
        when(request.getRequestURI()).thenReturn("/api/cart");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(response).setHeader(eq("X-RateLimit-Limit"), eq("60"));
        verify(response).setHeader(eq("X-RateLimit-Remaining"), anyString());
        verify(response).setHeader(eq("X-RateLimit-Reset"), anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should return 429 when rate limit exceeded")
    void shouldReturn429WhenRateLimitExceeded() throws Exception {
        // Given
        when(request.getRequestURI()).thenReturn("/api/cart");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        // Exhaust the rate limit
        for (int i = 0; i < 60; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // Reset mocks for the next call
        reset(response, filterChain);
        when(response.getWriter()).thenReturn(writer);

        // When - one more request should be rate limited
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(response).setStatus(429);
        verify(response).setHeader(eq("Retry-After"), anyString());
        verify(response).setContentType("application/problem+json");
        verify(filterChain, never()).doFilter(request, response);

        String responseBody = stringWriter.toString();
        assertThat(responseBody).contains("Rate Limit Exceeded");
        assertThat(responseBody).contains("Too many requests");
    }

    @Test
    @DisplayName("Should skip rate limiting for actuator endpoints")
    void shouldSkipRateLimitingForActuator() throws Exception {
        // Given
        when(request.getRequestURI()).thenReturn("/actuator/health");

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(response, never()).setHeader(eq("X-RateLimit-Limit"), anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should skip rate limiting when disabled")
    void shouldSkipWhenDisabled() throws Exception {
        // Given
        TestRateLimitProperties disabledProps = new TestRateLimitProperties(60, false);
        RateLimitFilter disabledFilter = new RateLimitFilter(rateLimitBuckets, disabledProps);
        // Note: No mocking of request needed as disabled filter won't check it

        // When
        disabledFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(response, never()).setHeader(eq("X-RateLimit-Limit"), anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should skip rate limiting for unauthenticated requests")
    void shouldSkipForUnauthenticated() throws Exception {
        // Given
        when(request.getRequestURI()).thenReturn("/api/cart");
        when(securityContext.getAuthentication()).thenReturn(null);

        // When
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(response, never()).setHeader(eq("X-RateLimit-Limit"), anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should use separate buckets for different users")
    void shouldUseSeparateBucketsForDifferentUsers() throws Exception {
        // Given
        when(request.getRequestURI()).thenReturn("/api/cart");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);

        // User 1 makes requests
        when(authentication.getName()).thenReturn("user1");
        for (int i = 0; i < 60; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // User 2 should still be able to make requests
        when(authentication.getName()).thenReturn("user2");
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain, times(61)).doFilter(request, response);
        assertThat(rateLimitBuckets).hasSize(2);
    }
}
