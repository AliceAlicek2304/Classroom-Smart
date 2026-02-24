package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alice.education.model.ExamSubmission;

public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {

    List<ExamSubmission> findAllByExam_IdAndStudent_UsernameOrderByCreatedAtDesc(Long examId, String username);

    boolean existsByExam_IdAndStudent_Username(Long examId, String username);

    List<ExamSubmission> findAllByExam_IdOrderByCreatedAtDesc(Long examId);
}
