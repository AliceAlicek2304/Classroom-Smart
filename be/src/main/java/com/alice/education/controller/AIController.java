package com.alice.education.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alice.education.dto.AIGenerateRequest;
import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.QuestionRequest;
import com.alice.education.service.AIService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * Generate questions from a text prompt.
     * POST /api/ai/generate-questions
     * Body: { "prompt": "...", "numQuestions": 5 }
     */
    @PostMapping("/generate-questions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<QuestionRequest>>> generateFromText(
            @RequestBody AIGenerateRequest request) {
        try {
            if (request.getPrompt() == null || request.getPrompt().isBlank()) {
                return ApiResponse.error("Vui lòng nhập nội dung yêu cầu");
            }
            int num = Math.max(1, Math.min(20, request.getNumQuestions()));
            List<QuestionRequest> questions = aiService.generateQuestionsFromText(request.getPrompt(), num);
            return ApiResponse.success("Tạo câu hỏi thành công", questions);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi tạo câu hỏi: " + e.getMessage());
        }
    }

    /**
     * Generate questions from a PDF file + optional text prompt.
     * POST /api/ai/generate-questions-file
     * Multipart: file (PDF), prompt (optional text), numQuestions (int)
     */
    @PostMapping("/generate-questions-file")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<QuestionRequest>>> generateFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prompt", required = false, defaultValue = "") String prompt,
            @RequestParam(value = "numQuestions", defaultValue = "5") int numQuestions) {
        try {
            if (file.isEmpty()) {
                return ApiResponse.error("File PDF không được để trống");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ApiResponse.error("Chỉ chấp nhận file PDF");
            }
            int num = Math.max(1, Math.min(20, numQuestions));
            List<QuestionRequest> questions = aiService.generateQuestionsFromPdf(file, prompt, num);
            return ApiResponse.success("Tạo câu hỏi thành công", questions);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi xử lý file: " + e.getMessage());
        }
    }
}
