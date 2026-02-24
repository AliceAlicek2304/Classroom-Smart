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
import com.alice.education.dto.ExamRequest;
import com.alice.education.dto.ExamResponse;
import com.alice.education.dto.ExamSubmissionResponse;
import com.alice.education.dto.SubmitExamRequest;
import com.alice.education.service.ExamService;
import com.alice.education.service.ExamSubmissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExamController {

    @Autowired
    private ExamService examService;

    @Autowired
    private ExamSubmissionService examSubmissionService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(
            @Valid @RequestBody ExamRequest request) {
        try {
            ExamResponse response = examService.createExam(request);
            return ApiResponse.success("Tạo bài kiểm tra thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamById(@PathVariable Long id) {
        try {
            ExamResponse response = examService.getExamById(id);
            return ApiResponse.success("Lấy bài kiểm tra thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getAllExams() {
        try {
            List<ExamResponse> responses = examService.getAllExams();
            return ApiResponse.success("Lấy danh sách bài kiểm tra thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getMyExams() {
        try {
            List<ExamResponse> responses = examService.getMyExams();
            return ApiResponse.success("Lấy bài kiểm tra của tôi thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getExamsByClassroom(
            @PathVariable Long classroomId) {
        try {
            List<ExamResponse> responses = examService.getExamsByClassroom(classroomId);
            return ApiResponse.success("Lấy bài kiểm tra theo lớp thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        try {
            ExamResponse response = examService.updateExam(id, request);
            return ApiResponse.success("Cập nhật bài kiểm tra thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ExamResponse>> toggleActive(@PathVariable Long id) {
        try {
            ExamResponse response = examService.toggleActive(id);
            return ApiResponse.success("Cập nhật trạng thái bài kiểm tra thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id) {
        try {
            examService.deleteExam(id);
            return ApiResponse.success("Xóa bài kiểm tra thành công", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ExamSubmissionResponse>> submitExam(
            @PathVariable Long id,
            @RequestBody SubmitExamRequest request) {
        try {
            ExamSubmissionResponse response = examSubmissionService.submitExam(id, request);
            return ApiResponse.success("Nộp bài kiểm tra thành công", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/my-submissions")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ExamSubmissionResponse>>> getMySubmissions(@PathVariable Long id) {
        try {
            List<ExamSubmissionResponse> responses = examSubmissionService.getMySubmissions(id);
            return ApiResponse.success("Lấy bài nộp thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<ExamSubmissionResponse>>> getAllSubmissions(@PathVariable Long id) {
        try {
            List<ExamSubmissionResponse> responses = examSubmissionService.getAllSubmissionsForExam(id);
            return ApiResponse.success("Lấy tất cả bài nộp thành công", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
