package com.github.pigeon.security;

import io.github.bucket4j.Bucket;

/**
 * Interface for rate limit properties.
 * Allows for testability without exposing the configuration class.
 */
public interface RateLimitProperties {
    int getRequestsPerMinute();
    boolean isEnabled();
    Bucket createBucket();
}
