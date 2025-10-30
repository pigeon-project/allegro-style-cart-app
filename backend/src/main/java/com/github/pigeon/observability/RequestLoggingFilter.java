package com.github.pigeon.observability;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class RequestLoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_ID_MDC_KEY = "requestId";
    private static final String ROUTE_MDC_KEY = "route";
    private static final String ENVIRONMENT_MDC_KEY = "environment";

    private final String environment;

    RequestLoggingFilter(@Value("${spring.profiles.active:default}") String environment) {
        this.environment = environment;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (!(request instanceof HttpServletRequest httpRequest) || 
            !(response instanceof HttpServletResponse httpResponse)) {
            chain.doFilter(request, response);
            return;
        }

        // Skip actuator endpoints from detailed logging
        String uri = httpRequest.getRequestURI();
        if (uri.startsWith("/actuator/")) {
            chain.doFilter(request, response);
            return;
        }

        // Generate or use existing request ID
        String requestId = httpRequest.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        // Set MDC context
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        MDC.put(ROUTE_MDC_KEY, httpRequest.getMethod() + " " + uri);
        MDC.put(ENVIRONMENT_MDC_KEY, environment);

        // Add request ID to response header
        httpResponse.setHeader(REQUEST_ID_HEADER, requestId);

        long startTime = System.currentTimeMillis();
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(httpResponse);

        try {
            chain.doFilter(request, responseWrapper);
        } finally {
            long durationMs = System.currentTimeMillis() - startTime;
            int status = responseWrapper.getStatus();
            
            logRequest(httpRequest, status, durationMs);
            
            responseWrapper.copyBodyToResponse();
            MDC.clear();
        }
    }

    private void logRequest(HttpServletRequest request, int status, long durationMs) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullPath = queryString != null ? uri + "?" + queryString : uri;
        
        // Determine log level based on status code
        if (status >= 500) {
            logger.error("Request completed: method={} uri={} status={} durationMs={}",
                    method, fullPath, status, durationMs);
        } else if (status >= 400) {
            logger.warn("Request completed: method={} uri={} status={} durationMs={}",
                    method, fullPath, status, durationMs);
        } else {
            logger.info("Request completed: method={} uri={} status={} durationMs={}",
                    method, fullPath, status, durationMs);
        }
    }
}
