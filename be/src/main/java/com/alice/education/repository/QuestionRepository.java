package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByAssignmentIdOrderByOrderNumberAsc(Long assignmentId);
    List<Question> findByExamIdOrderByOrderNumberAsc(Long examId);
}
