package com.alice.education.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ExamRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    private String dueDate;

    @NotNull(message = "Thời gian làm bài không được để trống")
    private Integer duration;

    private List<Long> classroomIds;

    @Valid
    private List<QuestionRequest> questions;

    public ExamRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public List<Long> getClassroomIds() { return classroomIds; }
    public void setClassroomIds(List<Long> classroomIds) { this.classroomIds = classroomIds; }

    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
}
