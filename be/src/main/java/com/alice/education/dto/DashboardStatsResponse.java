package com.alice.education.dto;

import java.util.List;

public class DashboardStatsResponse {
    private long totalSubjects;
    private long totalTextbooks;
    private long activeClassrooms;
    private long totalStudents;
    private List<RecentActivityResponse> recentActivities;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalSubjects, long totalTextbooks, long activeClassrooms, long totalStudents,
            List<RecentActivityResponse> recentActivities) {
        this.totalSubjects = totalSubjects;
        this.totalTextbooks = totalTextbooks;
        this.activeClassrooms = activeClassrooms;
        this.totalStudents = totalStudents;
        this.recentActivities = recentActivities;
    }

    public long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public long getTotalTextbooks() {
        return totalTextbooks;
    }

    public void setTotalTextbooks(long totalTextbooks) {
        this.totalTextbooks = totalTextbooks;
    }

    public long getActiveClassrooms() {
        return activeClassrooms;
    }

    public void setActiveClassrooms(long activeClassrooms) {
        this.activeClassrooms = activeClassrooms;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public List<RecentActivityResponse> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<RecentActivityResponse> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
