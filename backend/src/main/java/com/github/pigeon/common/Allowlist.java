package com.github.pigeon.common;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validation annotation for text fields that enforces allowlist pattern matching.
 * Implements SHARED-NFR Section 13 requirement for input validation with allowlists.
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AllowlistValidator.class)
@Documented
public @interface Allowlist {

    String message() default "Input contains invalid characters";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * The regex pattern that defines allowed characters
     */
    String pattern();
}
