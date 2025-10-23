package com.github.pigeon.issues;

import org.springframework.data.repository.CrudRepository;

import java.time.Instant;
import java.util.List;

interface PersistedIssueRepository extends CrudRepository<PersistedIssue, Long> {
    List<PersistedIssue> findTop50ByCreatedAtBefore(Instant instant);
}
