package com.github.pigeon.issues.web;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record IssueCreationRequest(
        @NotBlank
        @Length(min = 1, max = 300)
        String title
) {
}
