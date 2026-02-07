package com.alice.education.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.dto.ChapterRequest;
import com.alice.education.dto.ChapterResponse;
import com.alice.education.model.Chapter;
import com.alice.education.model.Textbook;
import com.alice.education.repository.ChapterRepository;
import com.alice.education.repository.TextbookRepository;

@Service
public class ChapterService {
    
    @Autowired
    private ChapterRepository chapterRepository;
    
    @Autowired
    private TextbookRepository textbookRepository;
    
    @Transactional
    public ChapterResponse createChapter(ChapterRequest request) {
        Textbook textbook = textbookRepository.findById(request.getTextbookId())
            .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + request.getTextbookId()));
        
        Chapter chapter = new Chapter();
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setTitle(request.getTitle());
        chapter.setDescription(request.getDescription());
        chapter.setTextbook(textbook);
        chapter.setIsActive(true);
        
        Chapter savedChapter = chapterRepository.save(chapter);
        return mapToResponse(savedChapter);
    }
    
    public ChapterResponse getChapterById(Long id) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Chapter not found with id: " + id));
        return mapToResponse(chapter);
    }
    
    public List<ChapterResponse> getAllChapters() {
        return chapterRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ChapterResponse> getChaptersByTextbook(Long textbookId) {
        return chapterRepository.findByTextbookIdOrderByChapterNumberAsc(textbookId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ChapterResponse> getActiveChapters() {
        return chapterRepository.findByIsActiveTrue().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public ChapterResponse updateChapter(Long id, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Chapter not found with id: " + id));
        
        Textbook textbook = textbookRepository.findById(request.getTextbookId())
            .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + request.getTextbookId()));
        
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setTitle(request.getTitle());
        chapter.setDescription(request.getDescription());
        chapter.setTextbook(textbook);
        
        Chapter updatedChapter = chapterRepository.save(chapter);
        return mapToResponse(updatedChapter);
    }
    
    @Transactional
    public void deleteChapter(Long id) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Chapter not found with id: " + id));
        chapter.setIsActive(false);
        chapterRepository.save(chapter);
    }
    
    private ChapterResponse mapToResponse(Chapter chapter) {
        ChapterResponse response = new ChapterResponse();
        response.setId(chapter.getId());
        response.setChapterNumber(chapter.getChapterNumber());
        response.setTitle(chapter.getTitle());
        response.setDescription(chapter.getDescription());
        response.setIsActive(chapter.getIsActive());
        response.setTextbookId(chapter.getTextbook().getId());
        response.setTextbookTitle(chapter.getTextbook().getTitle());
        response.setCreatedAt(chapter.getCreatedAt());
        response.setUpdatedAt(chapter.getUpdatedAt());
        return response;
    }
}
