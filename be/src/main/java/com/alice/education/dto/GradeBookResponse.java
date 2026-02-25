package com.alice.education.dto;

import java.util.List;

public class GradeBookResponse {

    private Long classroomId;
    private String classroomName;
    private List<GradeColumnResponse> columns;
    private List<StudentGradeRowResponse> rows;

    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }

    public String getClassroomName() { return classroomName; }
    public void setClassroomName(String classroomName) { this.classroomName = classroomName; }

    public List<GradeColumnResponse> getColumns() { return columns; }
    public void setColumns(List<GradeColumnResponse> columns) { this.columns = columns; }

    public List<StudentGradeRowResponse> getRows() { return rows; }
    public void setRows(List<StudentGradeRowResponse> rows) { this.rows = rows; }
}
