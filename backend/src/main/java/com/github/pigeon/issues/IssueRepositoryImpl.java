package com.github.pigeon.issues;

import com.github.pigeon.issues.api.Issue;
import com.github.pigeon.issues.api.IssueRepository;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

public class IssueRepositoryImpl implements IssueRepository {
    private final Clock clock;
    private final PersistedIssueRepository persistedIssueRepository;

    IssueRepositoryImpl(Clock clock, PersistedIssueRepository persistedIssueRepository) {
        this.clock = clock;
        this.persistedIssueRepository = persistedIssueRepository;
    }

    @Override
    public List<Issue> findLast50Tasks() {
        return persistedIssueRepository
                .findTop50ByCreatedAtBefore(clock.instant())
                .stream()
                .map(persistedIssue -> new Issue(persistedIssue.getTitle()))
                .toList();
    }

    @Override
    public UUID add(String title) {
        PersistedIssue persistedIssue = new PersistedIssue(title);
        return persistedIssueRepository.save(persistedIssue).getId();
    }
}
