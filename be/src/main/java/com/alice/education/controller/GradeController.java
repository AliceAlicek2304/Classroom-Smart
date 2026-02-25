package com.alice.education.controller;

import com.alice.education.dto.*;
import com.alice.education.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<GradeBookResponse>> getGradeBook(@PathVariable Long classroomId) {
        try {
            return ApiResponse.success("Lấy bảng điểm thành công", gradeService.getGradeBook(classroomId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/classroom/{classroomId}/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<GradeBookResponse>> getMyGradeBook(@PathVariable Long classroomId) {
        try {
            return ApiResponse.success("Lấy bảng điểm thành công", gradeService.getMyGradeBook(classroomId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/classroom/{classroomId}/columns")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<GradeColumnResponse>> addColumn(
            @PathVariable Long classroomId,
            @RequestBody AddGradeColumnRequest request) {
        try {
            return ApiResponse.success("Thêm cột điểm thành công", gradeService.addCustomColumn(classroomId, request));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/columns/{columnId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteColumn(@PathVariable Long columnId) {
        try {
            gradeService.deleteCustomColumn(columnId);
            return ApiResponse.success("Xóa cột điểm thành công");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{gradeId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<GradeEntryResponse>> updateGrade(
            @PathVariable Long gradeId,
            @RequestBody UpdateGradeRequest request) {
        try {
            return ApiResponse.success("Cập nhật điểm thành công", gradeService.updateGrade(gradeId, request));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
