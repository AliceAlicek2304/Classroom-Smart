package com.alice.education.dto;

import jakarta.validation.constraints.NotNull;

public class AddStudentRequest {
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    public AddStudentRequest() {
    }
    
    public AddStudentRequest(Long studentId) {
        this.studentId = studentId;
    }
    
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}
