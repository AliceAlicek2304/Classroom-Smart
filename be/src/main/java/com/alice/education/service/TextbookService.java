package com.alice.education.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.dto.TextbookRequest;
import com.alice.education.dto.TextbookResponse;
import com.alice.education.model.Subject;
import com.alice.education.model.Textbook;
import com.alice.education.repository.SubjectRepository;
import com.alice.education.repository.TextbookRepository;

@Service
public class TextbookService {

    @Autowired
    private TextbookRepository textbookRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    private final String uploadDir = "be/src/main/resources/static/chapter/";

    @Transactional
    public TextbookResponse createTextbook(TextbookRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + request.getSubjectId()));

        Textbook textbook = new Textbook();
        textbook.setTitle(request.getTitle());
        textbook.setPublisher(request.getPublisher());
        textbook.setPublicationYear(request.getPublicationYear());
        textbook.setDescription(request.getDescription());
        textbook.setGrade(request.getGrade());
        textbook.setSubject(subject);
        textbook.setIsActive(true);

        Textbook savedTextbook = textbookRepository.save(textbook);
        return mapToResponse(savedTextbook);
    }

    public TextbookResponse getTextbookById(Long id) {
        Textbook textbook = textbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + id));
        return mapToResponse(textbook);
    }

    public List<TextbookResponse> getAllTextbooks() {
        return textbookRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TextbookResponse> getTextbooksBySubject(Long subjectId) {
        return textbookRepository.findBySubjectId(subjectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TextbookResponse> getActiveTextbooks() {
        return textbookRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TextbookResponse> searchTextbooks(String keyword) {
        return textbookRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TextbookResponse updateTextbook(Long id, TextbookRequest request) {
        Textbook textbook = textbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + id));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + request.getSubjectId()));

        textbook.setTitle(request.getTitle());
        textbook.setPublisher(request.getPublisher());
        textbook.setPublicationYear(request.getPublicationYear());
        textbook.setDescription(request.getDescription());
        textbook.setGrade(request.getGrade());
        textbook.setSubject(subject);
        if (request.getIsActive() != null) {
            textbook.setIsActive(request.getIsActive());
        }

        Textbook updatedTextbook = textbookRepository.save(textbook);
        return mapToResponse(updatedTextbook);
    }

    @Transactional
    public void deleteTextbook(Long id) {
        Textbook textbook = textbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + id));
        textbook.setIsActive(false);
        textbookRepository.save(textbook);
    }

    private TextbookResponse mapToResponse(Textbook textbook) {
        TextbookResponse response = new TextbookResponse();
        response.setId(textbook.getId());
        response.setTitle(textbook.getTitle());
        response.setPublisher(textbook.getPublisher());
        response.setPublicationYear(textbook.getPublicationYear());
        response.setDescription(textbook.getDescription());
        response.setIsActive(textbook.getIsActive());
        response.setGrade(textbook.getGrade());
        response.setSubjectId(textbook.getSubject().getId());
        response.setSubjectName(textbook.getSubject().getName());
        response.setCreatedAt(textbook.getCreatedAt());
        response.setUpdatedAt(textbook.getUpdatedAt());
        return response;
    }

    public byte[] downloadAllChapters(Long id) {
        Textbook textbook = textbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Textbook not found with id: " + id));

        Set<com.alice.education.model.Chapter> chapters = textbook.getChapters();
        if (chapters.isEmpty()) {
            throw new RuntimeException("No chapters found for this textbook");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (com.alice.education.model.Chapter chapter : chapters) {
                if (chapter.getPdfUrl() != null && !chapter.getPdfUrl().isEmpty()) {
                    // pdfUrl is like /chapter/filename.pdf
                    String fileName = chapter.getPdfUrl().replace("/chapter/", "");
                    Path filePath = Paths.get(uploadDir).resolve(fileName);

                    if (Files.exists(filePath)) {
                        ZipEntry zipEntry = new ZipEntry(
                                "Chương " + chapter.getChapterNumber() + " - " + chapter.getTitle() + ".pdf");
                        zos.putNextEntry(zipEntry);
                        Files.copy(filePath, zos);
                        zos.closeEntry();
                    }
                }
            }
            zos.finish();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error creating zip file: " + e.getMessage());
        }
    }
}
