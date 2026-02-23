package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.alice.education.model.Classroom;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    List<Classroom> findByTeacherId(Long teacherId);

    List<Classroom> findBySubjectId(Long subjectId);

    List<Classroom> findByIsActiveTrue();

    List<Classroom> findByTeacherIdAndIsActiveTrue(Long teacherId);

    @Query("SELECT c FROM Classroom c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.gradeLevel) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Classroom> searchByKeyword(String keyword);

    List<Classroom> findTop5ByOrderByCreatedAtDesc();
}
