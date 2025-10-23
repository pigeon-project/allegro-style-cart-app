package com.github.pigeon.web.exceptions;

/**
 * Exception thrown when rate limit is exceeded.
 * Results in HTTP 429 status code.
 */
public class RateLimitExceededException extends RuntimeException {
    
    private final long retryAfterSeconds;
    
    public RateLimitExceededException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }
    
    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
