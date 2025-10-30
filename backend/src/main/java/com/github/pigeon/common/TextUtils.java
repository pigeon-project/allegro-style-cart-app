package com.github.pigeon.common;

import java.text.Normalizer;

/**
 * Utility class for text input processing.
 * Implements SHARED-NFR Section 10 requirements for text input handling.
 */
public final class TextUtils {

    private TextUtils() {
        // Utility class
    }

    /**
     * Trims and normalizes text to NFC form as per SHARED-NFR Section 10.
     * Text inputs MUST be trimmed & NFC-normalized prior to validation.
     *
     * @param text the text to normalize
     * @return normalized text, or null if input is null
     */
    public static String normalizeText(String text) {
        if (text == null) {
            return null;
        }
        
        // Trim whitespace
        String trimmed = text.trim();
        
        // NFC normalization (Canonical Decomposition, followed by Canonical Composition)
        return Normalizer.normalize(trimmed, Normalizer.Form.NFC);
    }

    /**
     * Validates text against an allowlist pattern.
     * Implements SHARED-NFR Section 13 requirement for input validation with allowlists.
     * 
     * @param text the text to validate
     * @param allowedPattern regex pattern for allowed characters
     * @return true if text matches the allowed pattern
     */
    public static boolean matchesAllowlist(String text, String allowedPattern) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        return text.matches(allowedPattern);
    }

    /**
     * Allowlist pattern for product titles and descriptions.
     * Allows: letters, numbers, spaces, and common punctuation
     */
    public static final String PRODUCT_TEXT_PATTERN = "^[\\p{L}\\p{N}\\p{Z}\\p{P}]+$";

    /**
     * Allowlist pattern for seller names.
     * Allows: letters, numbers, spaces, hyphens, and underscores
     */
    public static final String SELLER_NAME_PATTERN = "^[\\p{L}\\p{N} _-]+$";
}
