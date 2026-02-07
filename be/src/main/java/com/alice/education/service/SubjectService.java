package com.alice.education.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.dto.SubjectRequest;
import com.alice.education.dto.SubjectResponse;
import com.alice.education.model.Subject;
import com.alice.education.repository.SubjectRepository;

@Service
public class SubjectService {
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        if (subjectRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Subject with name '" + request.getName() + "' already exists");
        }
        
        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        subject.setIsActive(true);
        
        Subject savedSubject = subjectRepository.save(subject);
        return mapToResponse(savedSubject);
    }
    
    public SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        return mapToResponse(subject);
    }
    
    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<SubjectResponse> getActiveSubjects() {
        return subjectRepository.findByIsActiveTrue().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<SubjectResponse> searchSubjects(String keyword) {
        return subjectRepository.findByNameContainingIgnoreCase(keyword).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        
        subjectRepository.findByName(request.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("Subject with name '" + request.getName() + "' already exists");
            }
        });
        
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        
        Subject updatedSubject = subjectRepository.save(subject);
        return mapToResponse(updatedSubject);
    }
    
    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        subject.setIsActive(false);
        subjectRepository.save(subject);
    }
    
    private SubjectResponse mapToResponse(Subject subject) {
        return new SubjectResponse(
            subject.getId(),
            subject.getName(),
            subject.getDescription(),
            subject.getIsActive(),
            subject.getCreatedAt(),
            subject.getUpdatedAt()
        );
    }
}
