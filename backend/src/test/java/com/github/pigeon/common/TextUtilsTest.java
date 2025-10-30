package com.github.pigeon.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TextUtilsTest {

    @Test
    @DisplayName("Should trim whitespace from text")
    void shouldTrimWhitespace() {
        // Given
        String input = "  Hello World  ";

        // When
        String result = TextUtils.normalizeText(input);

        // Then
        assertThat(result).isEqualTo("Hello World");
    }

    @Test
    @DisplayName("Should normalize text to NFC form")
    void shouldNormalizeToNFC() {
        // Given - decomposed form (NFD)
        String decomposed = "e\u0301"; // é as e + combining acute accent

        // When
        String result = TextUtils.normalizeText(decomposed);

        // Then - composed form (NFC)
        assertThat(result).isEqualTo("\u00e9"); // é as single character
    }

    @Test
    @DisplayName("Should handle null input")
    void shouldHandleNull() {
        // When
        String result = TextUtils.normalizeText(null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle empty string")
    void shouldHandleEmptyString() {
        // When
        String result = TextUtils.normalizeText("");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should validate text against allowlist pattern")
    void shouldValidateAgainstAllowlist() {
        // Given
        String validText = "Product 123!";

        // When
        boolean result = TextUtils.matchesAllowlist(validText, TextUtils.PRODUCT_TEXT_PATTERN);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should reject text with invalid characters")
    void shouldRejectInvalidCharacters() {
        // Given
        String invalidText = "Product\u0000null"; // contains null byte

        // When
        boolean result = TextUtils.matchesAllowlist(invalidText, TextUtils.PRODUCT_TEXT_PATTERN);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should validate seller names")
    void shouldValidateSellerNames() {
        // Given
        String validSellerName = "Best-Seller_2024";

        // When
        boolean result = TextUtils.matchesAllowlist(validSellerName, TextUtils.SELLER_NAME_PATTERN);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should reject seller names with special characters")
    void shouldRejectSellerNamesWithSpecialChars() {
        // Given
        String invalidSellerName = "Seller@Email.com";

        // When
        boolean result = TextUtils.matchesAllowlist(invalidSellerName, TextUtils.SELLER_NAME_PATTERN);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should handle unicode letters in product text")
    void shouldHandleUnicodeLetters() {
        // Given
        String unicodeText = "Продукт 产品 プロダクト";

        // When
        boolean result = TextUtils.matchesAllowlist(unicodeText, TextUtils.PRODUCT_TEXT_PATTERN);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should normalize and validate combined")
    void shouldNormalizeAndValidate() {
        // Given - text with decomposed unicode and whitespace
        String input = "  Café  ";

        // When
        String normalized = TextUtils.normalizeText(input);
        boolean valid = TextUtils.matchesAllowlist(normalized, TextUtils.PRODUCT_TEXT_PATTERN);

        // Then
        assertThat(normalized).isEqualTo("Café");
        assertThat(valid).isTrue();
    }
}
