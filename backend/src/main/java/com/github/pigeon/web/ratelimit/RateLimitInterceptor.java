package com.github.pigeon.web.ratelimit;

import com.github.pigeon.web.exceptions.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting interceptor using token bucket algorithm.
 * Implements rate limiting as per SHARED-NFR.md requirements.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    // Rate limit: 100 requests per minute per user
    private static final long CAPACITY = 100;
    private static final Duration REFILL_DURATION = Duration.ofMinutes(1);

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String key = getClientKey(request);
        Bucket bucket = resolveBucket(key);
        
        long availableTokens = bucket.getAvailableTokens();
        
        // Add rate limit headers
        response.addHeader("X-RateLimit-Limit", String.valueOf(CAPACITY));
        response.addHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, availableTokens - 1)));
        
        if (bucket.tryConsume(1)) {
            // Calculate reset time (start of next minute)
            long resetTime = System.currentTimeMillis() / 1000 + REFILL_DURATION.getSeconds();
            response.addHeader("X-RateLimit-Reset", String.valueOf(resetTime));
            return true;
        }
        
        // Rate limit exceeded
        long waitForRefill = REFILL_DURATION.getSeconds();
        response.addHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() / 1000 + waitForRefill));
        
        throw new RateLimitExceededException(
            "Rate limit exceeded. Please try again later.",
            waitForRefill
        );
    }

    private Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(CAPACITY, Refill.intervally(CAPACITY, REFILL_DURATION));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private String getClientKey(HttpServletRequest request) {
        // Use authenticated user name if available, otherwise fall back to IP
        String user = request.getRemoteUser();
        if (user != null && !user.isBlank()) {
            return user;
        }
        // Use IP address as fallback
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr();
        }
        return clientIp;
    }
}
