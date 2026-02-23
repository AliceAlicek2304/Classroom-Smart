package com.alice.education.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.DashboardStatsResponse;
import com.alice.education.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        try {
            DashboardStatsResponse stats = dashboardService.getStats();
            return ApiResponse.success("Lấy số liệu Dashboard thành công!", stats);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
