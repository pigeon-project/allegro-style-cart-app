package com.github.pigeon.issues.api;

import java.util.List;
import java.util.UUID;

public interface IssueRepository {
    List<Issue> findLast50Tasks();

    UUID add(String title);
}
