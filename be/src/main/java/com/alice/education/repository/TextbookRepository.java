package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.Textbook;

@Repository
public interface TextbookRepository extends JpaRepository<Textbook, Long> {
    
    List<Textbook> findBySubjectId(Long subjectId);
    
    List<Textbook> findByIsActiveTrue();
    
    List<Textbook> findBySubjectIdAndIsActiveTrue(Long subjectId);
    
    List<Textbook> findByTitleContainingIgnoreCase(String keyword);
}
