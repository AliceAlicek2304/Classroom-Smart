package com.alice.education.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alice.education.dto.AIGenerateRequest;
import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.QuestionRequest;
import com.alice.education.service.AIRateLimiterService;
import com.alice.education.service.AIRateLimiterService.RateLimitResult;
import com.alice.education.service.AIService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Autowired
    private AIService aiService;

    @Autowired
    private AIRateLimiterService rateLimiter;

    @PostMapping("/generate-questions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> generateFromText(
            @RequestBody AIGenerateRequest request,
            Authentication auth) {

        ResponseEntity<?> limited = enforceRateLimit(auth);
        if (limited != null) return limited;

        try {
            if (request.getPrompt() == null || request.getPrompt().isBlank()) {
                return ApiResponse.error("Vui lòng nhập nội dung yêu cầu");
            }
            int num = Math.max(1, Math.min(20, request.getNumQuestions()));
            List<QuestionRequest> questions =
                    aiService.generateQuestionsFromText(request.getPrompt(), num);
            return ApiResponse.success("Tạo câu hỏi thành công", questions);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi tạo câu hỏi: " + e.getMessage());
        }
    }

    @PostMapping("/generate-questions-file")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> generateFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prompt", required = false, defaultValue = "") String prompt,
            @RequestParam(value = "numQuestions", defaultValue = "5") int numQuestions,
            Authentication auth) {

        ResponseEntity<?> limited = enforceRateLimit(auth);
        if (limited != null) return limited;

        try {
            if (file.isEmpty()) {
                return ApiResponse.error("File PDF không được để trống");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ApiResponse.error("Chỉ chấp nhận file PDF");
            }
            int num = Math.max(1, Math.min(20, numQuestions));
            List<QuestionRequest> questions =
                    aiService.generateQuestionsFromPdf(file, prompt, num);
            return ApiResponse.success("Tạo câu hỏi thành công", questions);
        } catch (Exception e) {
            return ApiResponse.error("Lỗi khi xử lý file: " + e.getMessage());
        }
    }

    @GetMapping("/rate-limit-status")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rateLimitStatus(Authentication auth) {
        String username = auth.getName();
        RateLimitResult status = rateLimiter.status(username);
        Map<String, Object> body = Map.of(
                "minuteUsed",      status.minuteUsed(),
                "minuteLimit",     rateLimiter.getMaxPerMinute(),
                "minuteRemaining", Math.max(0, rateLimiter.getMaxPerMinute() - status.minuteUsed()),
                "dayUsed",         status.dayUsed(),
                "dayLimit",        rateLimiter.getMaxPerDay(),
                "dayRemaining",    Math.max(0, rateLimiter.getMaxPerDay() - status.dayUsed())
        );
        return ApiResponse.success("Rate limit status", body);
    }

    private ResponseEntity<?> enforceRateLimit(Authentication auth) {
        if (auth == null) return null;

        RateLimitResult result = rateLimiter.checkAndRecord(auth.getName());
        if (result.allowed()) return null;

        Map<String, Object> body = Map.of(
                "success",            false,
                "message",            result.reason(),
                "retryAfterSeconds",  result.retryAfterSeconds(),
                "minuteUsed",         result.minuteUsed(),
                "minuteLimit",        rateLimiter.getMaxPerMinute(),
                "dayUsed",            result.dayUsed(),
                "dayLimit",           rateLimiter.getMaxPerDay()
        );
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(body);
    }
}
