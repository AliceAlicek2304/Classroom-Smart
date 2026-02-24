package com.alice.education.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AssignmentResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Boolean isActive;
    private Long teacherId;
    private String teacherName;
    private List<Long> classroomIds;
    private List<String> classroomNames;
    private List<QuestionResponse> questions;
    private int totalQuestions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean hasSubmitted; // null for teacher/admin, true/false for students

    public AssignmentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public List<Long> getClassroomIds() { return classroomIds; }
    public void setClassroomIds(List<Long> classroomIds) { this.classroomIds = classroomIds; }

    public List<String> getClassroomNames() { return classroomNames; }
    public void setClassroomNames(List<String> classroomNames) { this.classroomNames = classroomNames; }

    public List<QuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<QuestionResponse> questions) { this.questions = questions; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getHasSubmitted() { return hasSubmitted; }
    public void setHasSubmitted(Boolean hasSubmitted) { this.hasSubmitted = hasSubmitted; }
}
