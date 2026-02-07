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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.TextbookRequest;
import com.alice.education.dto.TextbookResponse;
import com.alice.education.service.TextbookService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/textbooks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TextbookController {
    
    @Autowired
    private TextbookService textbookService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<TextbookResponse>> createTextbook(@Valid @RequestBody TextbookRequest request) {
        try {
            TextbookResponse response = textbookService.createTextbook(request);
            return ApiResponse.success("Textbook created successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<TextbookResponse>> getTextbookById(@PathVariable Long id) {
        try {
            TextbookResponse response = textbookService.getTextbookById(id);
            return ApiResponse.success("Textbook retrieved successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<TextbookResponse>>> getAllTextbooks() {
        try {
            List<TextbookResponse> responses = textbookService.getAllTextbooks();
            return ApiResponse.success("Textbooks retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<TextbookResponse>>> getTextbooksBySubject(@PathVariable Long subjectId) {
        try {
            List<TextbookResponse> responses = textbookService.getTextbooksBySubject(subjectId);
            return ApiResponse.success("Textbooks retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<TextbookResponse>>> getActiveTextbooks() {
        try {
            List<TextbookResponse> responses = textbookService.getActiveTextbooks();
            return ApiResponse.success("Active textbooks retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<TextbookResponse>>> searchTextbooks(@RequestParam String keyword) {
        try {
            List<TextbookResponse> responses = textbookService.searchTextbooks(keyword);
            return ApiResponse.success("Search results retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<TextbookResponse>> updateTextbook(
            @PathVariable Long id, 
            @Valid @RequestBody TextbookRequest request) {
        try {
            TextbookResponse response = textbookService.updateTextbook(id, request);
            return ApiResponse.success("Textbook updated successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteTextbook(@PathVariable Long id) {
        try {
            textbookService.deleteTextbook(id);
            return ApiResponse.success("Textbook deleted successfully", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
