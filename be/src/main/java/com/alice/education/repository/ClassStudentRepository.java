package com.alice.education.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.alice.education.model.ClassStudent;

@Repository
public interface ClassStudentRepository extends JpaRepository<ClassStudent, Long> {
    
    List<ClassStudent> findByClassroomId(Long classroomId);
    
    List<ClassStudent> findByStudentId(Long studentId);
    
    Optional<ClassStudent> findByClassroomIdAndStudentId(Long classroomId, Long studentId);
    
    boolean existsByClassroomIdAndStudentId(Long classroomId, Long studentId);
    
    @Query("SELECT cs FROM ClassStudent cs WHERE cs.classroom.id = :classroomId AND cs.isActive = true")
    List<ClassStudent> findActiveStudentsByClassroomId(Long classroomId);
    
    long countByClassroomId(Long classroomId);
}
