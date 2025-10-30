package com.github.pigeon.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

/**
 * Rate limiting filter that enforces per-user request limits.
 * Implements SHARED-NFR Section 13 requirements:
 * - Includes X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset headers
 * - Returns HTTP 429 with Retry-After header on rate limit violations
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> rateLimitBuckets;
    private final RateLimitProperties properties;

    public RateLimitFilter(Map<String, Bucket> rateLimitBuckets,
                           RateLimitProperties properties) {
        this.rateLimitBuckets = rateLimitBuckets;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip rate limiting if disabled
        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip rate limiting for actuator endpoints and public endpoints
        String requestUri = request.getRequestURI();
        if (requestUri.startsWith("/actuator") || 
            requestUri.startsWith("/swagger-ui") || 
            requestUri.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get user identifier
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = authentication.getName();
        
        // Get or create bucket for this user
        Bucket bucket = rateLimitBuckets.computeIfAbsent(userId, k -> properties.createBucket());

        // Try to consume 1 token
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        // Add rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(properties.getRequestsPerMinute()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, probe.getRemainingTokens())));
        
        // Calculate reset time (current time + time until next refill)
        // Use long arithmetic to avoid overflow
        long nanosToWait = probe.getNanosToWaitForRefill();
        long secondsToWait = nanosToWait / 1_000_000_000L;
        long resetTime = Instant.now().getEpochSecond() + secondsToWait;
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetTime));

        if (probe.isConsumed()) {
            // Request allowed
            filterChain.doFilter(request, response);
        } else {
            // Rate limit exceeded - reuse nanosToWait from above
            long retryAfterSeconds = nanosToWait / 1_000_000_000L;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/problem+json");
            
            String problemDetail = String.format(
                    "{\"type\":\"https://api.allegro-cart.com/problems/rate-limit-exceeded\"," +
                    "\"title\":\"Rate Limit Exceeded\"," +
                    "\"status\":429," +
                    "\"detail\":\"Too many requests. Please retry after %d seconds.\"," +
                    "\"instance\":\"%s\"}",
                    retryAfterSeconds,
                    requestUri
            );
            
            response.getWriter().write(problemDetail);
        }
    }
}
