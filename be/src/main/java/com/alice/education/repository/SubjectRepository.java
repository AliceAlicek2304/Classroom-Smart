package com.alice.education.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    Optional<Subject> findByName(String name);
    
    List<Subject> findByIsActiveTrue();
    
    List<Subject> findByNameContainingIgnoreCase(String keyword);
}
