package com.alice.education.service;

import java.util.List;
import java.util.stream.Collectors;

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
}
