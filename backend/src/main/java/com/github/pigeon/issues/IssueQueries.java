package com.github.pigeon.issues;

import com.github.pigeon.issues.api.Issue;
import com.github.pigeon.issues.api.IssueRepository;

import java.util.List;

public class IssueQueries {
    private final IssueRepository issueRepository;

    IssueQueries(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    public List<Issue> getIssues() {
        return issueRepository.findLast50Tasks();
    }
}
