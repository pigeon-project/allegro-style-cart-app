package com.github.pigeon.common;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for the @Allowlist annotation.
 * Validates text against allowlist patterns after normalization.
 */
public class AllowlistValidator implements ConstraintValidator<Allowlist, String> {

    private String pattern;

    @Override
    public void initialize(Allowlist constraintAnnotation) {
        this.pattern = constraintAnnotation.pattern();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Use @NotNull for null checks
        }

        // Normalize text before validation (SHARED-NFR Section 10)
        String normalized = TextUtils.normalizeText(value);

        // Validate against allowlist pattern (SHARED-NFR Section 13)
        return TextUtils.matchesAllowlist(normalized, pattern);
    }
}
