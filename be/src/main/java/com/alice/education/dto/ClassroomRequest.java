package com.alice.education.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ClassroomRequest {
    
    @NotBlank(message = "Classroom name is required")
    @Size(max = 100, message = "Classroom name must not exceed 100 characters")
    private String name;
    
    @Size(max = 50, message = "Grade level must not exceed 50 characters")
    private String gradeLevel;
    
    @Size(max = 50, message = "School year must not exceed 50 characters")
    private String schoolYear;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    
    public ClassroomRequest() {
    }
    
    public ClassroomRequest(String name, String gradeLevel, String schoolYear, 
                           String description, Long subjectId) {
        this.name = name;
        this.gradeLevel = gradeLevel;
        this.schoolYear = schoolYear;
        this.description = description;
        this.subjectId = subjectId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getGradeLevel() {
        return gradeLevel;
    }
    
    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }
    
    public String getSchoolYear() {
        return schoolYear;
    }
    
    public void setSchoolYear(String schoolYear) {
        this.schoolYear = schoolYear;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Long getSubjectId() {
        return subjectId;
    }
    
    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }
}
