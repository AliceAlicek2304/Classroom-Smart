package com.alice.education.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.education.model.GradeColumn;
import com.alice.education.model.StudentGrade;

@Repository
public interface StudentGradeRepository extends JpaRepository<StudentGrade, Long> {

    List<StudentGrade> findByClassroomIdAndStudentId(Long classroomId, Long studentId);

    List<StudentGrade> findByClassroomId(Long classroomId);

    List<StudentGrade> findByGradeColumnId(Long gradeColumnId);

    void deleteByGradeColumn(GradeColumn gradeColumn);
}
