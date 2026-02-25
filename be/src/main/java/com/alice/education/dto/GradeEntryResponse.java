package com.alice.education.dto;

public class GradeEntryResponse {

    private Long gradeId;
    private Long columnId;
    private Double score;

    public Long getGradeId() { return gradeId; }
    public void setGradeId(Long gradeId) { this.gradeId = gradeId; }

    public Long getColumnId() { return columnId; }
    public void setColumnId(Long columnId) { this.columnId = columnId; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
}
