package com.github.pigeon.web.exceptions;

/**
 * Exception thrown when a precondition fails (e.g., ETag mismatch, If-Match failure).
 * Results in HTTP 412 status code.
 */
public class PreconditionFailedException extends RuntimeException {
    
    public PreconditionFailedException(String message) {
        super(message);
    }
}
