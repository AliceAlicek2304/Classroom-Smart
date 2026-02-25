package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.GradeColumn;

@Repository
public interface GradeColumnRepository extends JpaRepository<GradeColumn, Long> {

    List<GradeColumn> findByClassroomIdOrderByOrderNumber(Long classroomId);

    List<GradeColumn> findByClassroomId(Long classroomId);

    int countByClassroomId(Long classroomId);
}
