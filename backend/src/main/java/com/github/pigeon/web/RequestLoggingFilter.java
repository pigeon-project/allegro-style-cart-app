package com.github.pigeon.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

/**
 * Filter that logs HTTP request/response details with structured information.
 * Captures: timestamp, level, service, environment, requestId, route, durationMs, status, errorCode
 * This filter runs after RequestCorrelationFilter to ensure correlation ID is in MDC.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String SERVICE_NAME = "allegro-style-cart-app";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        String route = request.getMethod() + " " + request.getRequestURI();
        String environment = System.getProperty("spring.profiles.active", "dev");

        // Add service and environment to MDC
        MDC.put("service", SERVICE_NAME);
        MDC.put("environment", environment);
        MDC.put("route", route);

        // Wrap response to capture status
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(request, responseWrapper);
        } finally {
            long durationMs = System.currentTimeMillis() - startTime;
            int status = responseWrapper.getStatus();

            // Add status and duration to MDC
            MDC.put("status", String.valueOf(status));
            MDC.put("durationMs", String.valueOf(durationMs));

            // Add errorCode if response is an error
            if (status >= 400) {
                String errorCode = determineErrorCode(status);
                MDC.put("errorCode", errorCode);
            }

            // Log the request with all context
            if (status >= 500) {
                logger.error("HTTP request completed with server error");
            } else if (status >= 400) {
                logger.warn("HTTP request completed with client error");
            } else {
                logger.info("HTTP request completed successfully");
            }

            // Clean up MDC
            MDC.remove("service");
            MDC.remove("environment");
            MDC.remove("route");
            MDC.remove("status");
            MDC.remove("durationMs");
            MDC.remove("errorCode");

            // Copy response body
            responseWrapper.copyBodyToResponse();
        }
    }

    private String determineErrorCode(int status) {
        return switch (status) {
            case 400 -> "BAD_REQUEST";
            case 401 -> "UNAUTHORIZED";
            case 403 -> "FORBIDDEN";
            case 404 -> "NOT_FOUND";
            case 409 -> "CONFLICT";
            case 412 -> "PRECONDITION_FAILED";
            case 422 -> "UNPROCESSABLE_ENTITY";
            case 429 -> "RATE_LIMIT_EXCEEDED";
            case 500 -> "INTERNAL_SERVER_ERROR";
            case 502 -> "BAD_GATEWAY";
            case 503 -> "SERVICE_UNAVAILABLE";
            default -> "HTTP_" + status;
        };
    }
}
