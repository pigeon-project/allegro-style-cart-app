package com.github.pigeon.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Configuration for rate limiting using Bucket4j.
 * Implements per-user rate limiting as specified in SHARED-NFR Section 13.
 */
@Configuration
class RateLimitConfiguration {

    @Bean
    RateLimitPropertiesImpl rateLimitProperties() {
        return new RateLimitPropertiesImpl();
    }

    @Bean
    Map<String, Bucket> rateLimitBuckets() {
        return new ConcurrentHashMap<>();
    }

    @ConfigurationProperties(prefix = "rate-limit")
    static class RateLimitPropertiesImpl implements RateLimitProperties {
        /**
         * Maximum number of requests per minute per user
         */
        private int requestsPerMinute = 60;

        /**
         * Whether rate limiting is enabled
         */
        private boolean enabled = true;

        public int getRequestsPerMinute() {
            return requestsPerMinute;
        }

        public void setRequestsPerMinute(int requestsPerMinute) {
            this.requestsPerMinute = requestsPerMinute;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

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
}
