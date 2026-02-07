package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.Chapter;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    
    List<Chapter> findByTextbookId(Long textbookId);
    
    List<Chapter> findByTextbookIdOrderByChapterNumberAsc(Long textbookId);
    
    List<Chapter> findByIsActiveTrue();
    
    List<Chapter> findByTextbookIdAndIsActiveTrue(Long textbookId);
}
