package com.github.pigeon.issues.web;

import com.github.pigeon.issues.IssueCommands;
import com.github.pigeon.issues.IssueQueries;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/issues")
class IssueController {

    private final IssueQueries issueQueries;
    private final IssueCommands issueCommands;

    IssueController(IssueQueries issueQueries, IssueCommands issueCommands) {
        this.issueQueries = issueQueries;
        this.issueCommands = issueCommands;
    }

    @GetMapping
    List<IssueResponse> getLastIssues() {
        return issueQueries.getIssues()
                .stream()
                .map(issue -> new IssueResponse(issue.getId().toString(), issue.getTitle()))
                .toList();
    }

    @PostMapping
    ResponseEntity<Void> createIssue(@Valid @RequestBody IssueCreationRequest issueCreationRequest) {
        UUID uuid = issueCommands.create(issueCreationRequest.title());
        return ResponseEntity.created(URI.create("/api/issues/%s".formatted(uuid))).build();
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return Map.of("errors", errors);
    }
}
