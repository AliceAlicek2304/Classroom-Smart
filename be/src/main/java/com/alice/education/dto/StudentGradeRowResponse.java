package com.alice.education.dto;

import java.util.List;

public class StudentGradeRowResponse {

    private Long studentId;
    private String studentName;
    private String username;
    private List<GradeEntryResponse> grades;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public List<GradeEntryResponse> getGrades() { return grades; }
    public void setGrades(List<GradeEntryResponse> grades) { this.grades = grades; }
}
