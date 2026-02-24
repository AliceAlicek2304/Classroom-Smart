package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alice.education.model.AssignmentSubmission;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    List<AssignmentSubmission> findAllByAssignment_IdAndStudent_UsernameOrderByCreatedAtDesc(
            Long assignmentId, String username);

    boolean existsByAssignment_IdAndStudent_Username(Long assignmentId, String username);

    List<AssignmentSubmission> findAllByAssignment_IdOrderByCreatedAtDesc(Long assignmentId);
}
