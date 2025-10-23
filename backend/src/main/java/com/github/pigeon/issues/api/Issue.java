package com.github.pigeon.issues.api;

import java.util.UUID;

public class Issue {
    private final UUID id;
    private final String title;

    public Issue(String title) {
        this.id = UUID.randomUUID();
        this.title = title;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }
}
