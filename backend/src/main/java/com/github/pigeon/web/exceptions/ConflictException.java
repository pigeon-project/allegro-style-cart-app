package com.github.pigeon.web.exceptions;

/**
 * Exception thrown when a conflict occurs (e.g., duplicate resource, concurrent modification).
 * Results in HTTP 409 status code.
 */
public class ConflictException extends RuntimeException {
    
    public ConflictException(String message) {
        super(message);
    }
    
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
