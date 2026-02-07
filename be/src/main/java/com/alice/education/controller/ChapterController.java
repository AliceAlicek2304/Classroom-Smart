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
import com.alice.education.dto.ChapterRequest;
import com.alice.education.dto.ChapterResponse;
import com.alice.education.service.ChapterService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chapters")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChapterController {
    
    @Autowired
    private ChapterService chapterService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(@Valid @RequestBody ChapterRequest request) {
        try {
            ChapterResponse response = chapterService.createChapter(request);
            return ApiResponse.success("Chapter created successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapterById(@PathVariable Long id) {
        try {
            ChapterResponse response = chapterService.getChapterById(id);
            return ApiResponse.success("Chapter retrieved successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getAllChapters() {
        try {
            List<ChapterResponse> responses = chapterService.getAllChapters();
            return ApiResponse.success("Chapters retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/textbook/{textbookId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersByTextbook(@PathVariable Long textbookId) {
        try {
            List<ChapterResponse> responses = chapterService.getChaptersByTextbook(textbookId);
            return ApiResponse.success("Chapters retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getActiveChapters() {
        try {
            List<ChapterResponse> responses = chapterService.getActiveChapters();
            return ApiResponse.success("Active chapters retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(
            @PathVariable Long id, 
            @Valid @RequestBody ChapterRequest request) {
        try {
            ChapterResponse response = chapterService.updateChapter(id, request);
            return ApiResponse.success("Chapter updated successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long id) {
        try {
            chapterService.deleteChapter(id);
            return ApiResponse.success("Chapter deleted successfully", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
