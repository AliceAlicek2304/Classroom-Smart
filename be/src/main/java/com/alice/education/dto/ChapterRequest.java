package com.alice.education.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ChapterRequest {

    @NotNull(message = "Chapter number is required")
    private Integer chapterNumber;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String pdfUrl;

    @NotNull(message = "Textbook ID is required")
    private Long textbookId;

    public ChapterRequest() {
    }

    public ChapterRequest(Integer chapterNumber, String title, String description, Long textbookId) {
        this.chapterNumber = chapterNumber;
        this.title = title;
        this.description = description;
        this.textbookId = textbookId;
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

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public Long getTextbookId() {
        return textbookId;
    }

    public void setTextbookId(Long textbookId) {
        this.textbookId = textbookId;
    }
}
