package com.github.pigeon.issues;

import com.github.pigeon.issues.api.IssueRepository;

import java.util.UUID;

public class IssueCommands {
    private final IssueRepository issueRepository;

    IssueCommands(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    public UUID create(String title) {
        return issueRepository.add(title);
    }
}
