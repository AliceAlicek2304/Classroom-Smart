package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByTeacherId(Long teacherId);
    List<Exam> findByClassroomsId(Long classroomId);
    List<Exam> findByIsActiveTrue();
}
