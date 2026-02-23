package com.alice.education.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

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

    private final String uploadDir = "src/main/resources/static/chapter/";

    @Transactional
    public ChapterResponse createChapter(ChapterRequest request, MultipartFile file) {
        Textbook textbook = textbookRepository.findById(request.getTextbookId())
                .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + request.getTextbookId()));

        Chapter chapter = new Chapter();
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setTitle(request.getTitle());
        chapter.setDescription(request.getDescription());
        chapter.setTextbook(textbook);
        chapter.setIsActive(true);

        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);
            chapter.setPdfUrl("/chapter/" + fileName);
        }

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
    public ChapterResponse updateChapter(Long id, ChapterRequest request, MultipartFile file) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chapter not found with id: " + id));

        Textbook textbook = textbookRepository.findById(request.getTextbookId())
                .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + request.getTextbookId()));

        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setTitle(request.getTitle());
        chapter.setDescription(request.getDescription());
        chapter.setTextbook(textbook);

        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);
            chapter.setPdfUrl("/chapter/" + fileName);
        }

        Chapter updatedChapter = chapterRepository.save(chapter);
        return mapToResponse(updatedChapter);
    }

    private String saveFile(MultipartFile file) {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }

            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path targetLocation = path.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
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
        response.setPdfUrl(chapter.getPdfUrl());
        response.setTextbookId(chapter.getTextbook().getId());
        response.setTextbookTitle(chapter.getTextbook().getTitle());
        response.setCreatedAt(chapter.getCreatedAt());
        response.setUpdatedAt(chapter.getUpdatedAt());
        return response;
    }
}
