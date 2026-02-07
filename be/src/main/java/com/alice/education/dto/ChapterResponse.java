package com.alice.education.dto;

import java.time.LocalDateTime;

public class ChapterResponse {
    
    private Long id;
    private Integer chapterNumber;
    private String title;
    private String description;
    private Boolean isActive;
    private Long textbookId;
    private String textbookTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public ChapterResponse() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getChapterNumber() {
        return chapterNumber;
    }
    
    public void setChapterNumber(Integer chapterNumber) {
        this.chapterNumber = chapterNumber;
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
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Long getTextbookId() {
        return textbookId;
    }
    
    public void setTextbookId(Long textbookId) {
        this.textbookId = textbookId;
    }
    
    public String getTextbookTitle() {
        return textbookTitle;
    }
    
    public void setTextbookTitle(String textbookTitle) {
        this.textbookTitle = textbookTitle;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
