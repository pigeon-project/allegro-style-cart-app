package com.github.pigeon.issues;

import com.github.pigeon.issues.api.IssueRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
class IssueConfiguration {

    @Bean
    IssueQueries issueQueries(IssueRepository issueRepository) {
        return new IssueQueries(issueRepository);
    }

    @Bean
    IssueCommands issueCommands(IssueRepository issueRepository) {
        return new IssueCommands(issueRepository);
    }

    @Bean
    IssueRepository issueRepository(PersistedIssueRepository persistedIssueRepository, Clock clock) {
        return new IssueRepositoryImpl(clock, persistedIssueRepository);
    }

}
