package com.alice.education.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.AssignmentRequest;
import com.alice.education.dto.AssignmentResponse;
import com.alice.education.dto.SubmissionResponse;
import com.alice.education.dto.SubmitAssignmentRequest;
import com.alice.education.service.AssignmentService;
import com.alice.education.service.AssignmentSubmissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private AssignmentSubmissionService submissionService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @Valid @RequestBody AssignmentRequest request) {
        try {
            AssignmentResponse response = assignmentService.createAssignment(request);
            return ApiResponse.success("Tạo bài tập thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable Long id) {
        try {
            AssignmentResponse response = assignmentService.getAssignmentById(id);
            return ApiResponse.success("Lấy bài tập thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAllAssignments() {
        try {
            List<AssignmentResponse> responses = assignmentService.getAllAssignments();
            return ApiResponse.success("Lấy danh sách bài tập thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getMyAssignments() {
        try {
            List<AssignmentResponse> responses = assignmentService.getMyAssignments();
            return ApiResponse.success("Lấy bài tập của tôi thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/enrolled")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getEnrolledAssignments() {
        try {
            List<AssignmentResponse> responses = assignmentService.getEnrolledAssignments();
            return ApiResponse.success("Lấy bài tập đã đăng ký thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByClassroom(
            @PathVariable Long classroomId) {
        try {
            List<AssignmentResponse> responses = assignmentService.getAssignmentsByClassroom(classroomId);
            return ApiResponse.success("Lấy bài tập theo lớp thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @PathVariable Long id, @Valid @RequestBody AssignmentRequest request) {
        try {
            AssignmentResponse response = assignmentService.updateAssignment(id, request);
            return ApiResponse.success("Cập nhật bài tập thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> toggleActive(@PathVariable Long id) {
        try {
            AssignmentResponse response = assignmentService.toggleActive(id);
            return ApiResponse.success("Cập nhật trạng thái bài tập thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        try {
            assignmentService.deleteAssignment(id);
            return ApiResponse.success("Xóa bài tập thành công", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitAssignment(
            @PathVariable Long id,
            @RequestBody SubmitAssignmentRequest request) {
        try {
            SubmissionResponse response = submissionService.submitAssignment(id, request);
            return ApiResponse.success("Nộp bài thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getAllSubmissions(@PathVariable Long id) {
        try {
            List<SubmissionResponse> responses = submissionService.getAllSubmissionsForAssignment(id);
            return ApiResponse.success("Lấy danh sách bài nộp thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/my-submissions")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getMySubmissions(@PathVariable Long id) {
        try {
            List<SubmissionResponse> responses = submissionService.getMySubmissions(id);
            return ApiResponse.success("Lấy lịch sử nộp bài thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
