package com.github.pigeon.web;

import com.github.pigeon.web.exceptions.*;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler that returns RFC 7807 Problem Details for errors.
 * Ensures no stack traces are exposed to clients (only logged).
 * Follows SHARED-NFR.md error handling requirements.
 */
@RestControllerAdvice
class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String PROBLEM_BASE_URI = "https://api.allegro-style-cart.com/problems/";

    @Override
    protected ResponseEntity<Object> handleNoHandlerFoundException(
            NoHandlerFoundException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        
        log.debug("No handler found for: {}", ex.getRequestURL());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND,
            "The requested resource was not found"
        );
        problemDetail.setTitle("Not Found");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "not-found"));
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problemDetail);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        
        log.warn("Validation error: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            "Validation failed for one or more fields"
        );
        problemDetail.setTitle("Validation Error");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "validation-error"));
        problemDetail.setProperty("errors", errors);
        
        return ResponseEntity.badRequest().body(problemDetail);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ProblemDetail handleConstraintViolationException(ConstraintViolationException ex) {
        log.warn("Constraint violation: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation ->
            errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            "Constraint violation"
        );
        problemDetail.setTitle("Validation Error");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "validation-error"));
        problemDetail.setProperty("errors", errors);
        
        return problemDetail;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            ex.getMessage()
        );
        problemDetail.setTitle("Bad Request");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "bad-request"));
        return problemDetail;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.debug("Resource not found: {} - {}", ex.getResourceType(), ex.getResourceId());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND,
            ex.getMessage()
        );
        problemDetail.setTitle("Resource Not Found");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "not-found"));
        problemDetail.setProperty("resourceType", ex.getResourceType());
        problemDetail.setProperty("resourceId", ex.getResourceId());
        
        return problemDetail;
    }

    @ExceptionHandler(ConflictException.class)
    ProblemDetail handleConflictException(ConflictException ex) {
        log.warn("Conflict: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT,
            ex.getMessage()
        );
        problemDetail.setTitle("Conflict");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "conflict"));
        
        return problemDetail;
    }

    @ExceptionHandler(PreconditionFailedException.class)
    ProblemDetail handlePreconditionFailedException(PreconditionFailedException ex) {
        log.warn("Precondition failed: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.PRECONDITION_FAILED,
            ex.getMessage()
        );
        problemDetail.setTitle("Precondition Failed");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "precondition-failed"));
        
        return problemDetail;
    }

    @ExceptionHandler(DomainValidationException.class)
    ProblemDetail handleDomainValidationException(DomainValidationException ex) {
        log.warn("Domain validation failed: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNPROCESSABLE_ENTITY,
            ex.getMessage()
        );
        problemDetail.setTitle("Domain Validation Failed");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "domain-validation"));
        
        if (!ex.getValidationErrors().isEmpty()) {
            problemDetail.setProperty("errors", ex.getValidationErrors());
        }
        
        return problemDetail;
    }

    @ExceptionHandler(RateLimitExceededException.class)
    ResponseEntity<ProblemDetail> handleRateLimitExceededException(RateLimitExceededException ex) {
        log.warn("Rate limit exceeded: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.TOO_MANY_REQUESTS,
            ex.getMessage()
        );
        problemDetail.setTitle("Rate Limit Exceeded");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "rate-limit-exceeded"));
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Retry-After", String.valueOf(ex.getRetryAfterSeconds()));
        
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .headers(headers)
                .body(problemDetail);
    }

    @ExceptionHandler(AuthenticationException.class)
    ProblemDetail handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNAUTHORIZED,
            "Authentication is required to access this resource"
        );
        problemDetail.setTitle("Unauthorized");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "unauthorized"));
        
        return problemDetail;
    }

    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.FORBIDDEN,
            "You do not have permission to access this resource"
        );
        problemDetail.setTitle("Forbidden");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "forbidden"));
        
        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleGenericException(Exception ex) {
        // Log full stack trace for server errors
        log.error("Internal server error", ex);
        
        // Return generic message without stack trace
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred"
        );
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setType(URI.create(PROBLEM_BASE_URI + "internal-error"));
        
        return problemDetail;
    }
}
