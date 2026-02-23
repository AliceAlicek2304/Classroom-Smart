package com.alice.education.dto;

import java.time.LocalDateTime;

public class RecentActivityResponse {
    private String type;
    private String title;
    private String description;
    private LocalDateTime time;

    public RecentActivityResponse() {
    }

    public RecentActivityResponse(String type, String title, String description, LocalDateTime time) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.time = time;
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}
