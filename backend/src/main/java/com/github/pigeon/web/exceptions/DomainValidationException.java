package com.github.pigeon.web.exceptions;

import java.util.Map;

/**
 * Exception thrown when domain-level validation fails.
 * Results in HTTP 422 status code.
 */
public class DomainValidationException extends RuntimeException {
    
    private final Map<String, String> validationErrors;
    
    public DomainValidationException(String message) {
        super(message);
        this.validationErrors = Map.of();
    }
    
    public DomainValidationException(String message, Map<String, String> validationErrors) {
        super(message);
        this.validationErrors = validationErrors;
    }
    
    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }
}
