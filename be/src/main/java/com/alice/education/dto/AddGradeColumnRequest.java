package com.alice.education.dto;

public class AddGradeColumnRequest {

    private String name;
    private String type;
    private Long examId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
}
