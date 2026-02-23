package com.alice.education.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class AssignmentRequest {

    @NotBlank
    private String title;

    private String description;

    private String dueDate; // ISO string, parsed in service

    private List<Long> classroomIds = new ArrayList<>();

    @Valid
    private List<QuestionRequest> questions = new ArrayList<>();

    public AssignmentRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public List<Long> getClassroomIds() { return classroomIds; }
    public void setClassroomIds(List<Long> classroomIds) { this.classroomIds = classroomIds; }

    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
}
