package com.alice.education.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.dto.AddStudentRequest;
import com.alice.education.dto.ClassroomRequest;
import com.alice.education.dto.ClassroomResponse;
import com.alice.education.dto.StudentInClassResponse;
import com.alice.education.model.Account;
import com.alice.education.model.ClassStudent;
import com.alice.education.model.Classroom;
import com.alice.education.model.Role;
import com.alice.education.model.Subject;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.ClassStudentRepository;
import com.alice.education.repository.ClassroomRepository;
import com.alice.education.repository.SubjectRepository;

@Service
public class ClassroomService {
    
    @Autowired
    private ClassroomRepository classroomRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private ClassStudentRepository classStudentRepository;
    
    @Transactional
    public ClassroomResponse createClassroom(ClassroomRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        if (teacher.getRole() != Role.TEACHER) {
            throw new RuntimeException("Only teachers can create classrooms");
        }
        
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + request.getSubjectId()));
        
        Classroom classroom = new Classroom();
        classroom.setName(request.getName());
        classroom.setGradeLevel(request.getGradeLevel());
        classroom.setSchoolYear(request.getSchoolYear());
        classroom.setDescription(request.getDescription());
        classroom.setTeacher(teacher);
        classroom.setSubject(subject);
        classroom.setIsActive(true);
        
        Classroom savedClassroom = classroomRepository.save(classroom);
        return mapToResponse(savedClassroom);
    }
    
    public ClassroomResponse getClassroomById(Long id) {
        Classroom classroom = classroomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + id));
        return mapToResponse(classroom);
    }
    
    public List<ClassroomResponse> getAllClassrooms() {
        return classroomRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ClassroomResponse> getMyClassrooms() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        return classroomRepository.findByTeacherId(teacher.getId()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ClassroomResponse> getClassroomsBySubject(Long subjectId) {
        return classroomRepository.findBySubjectId(subjectId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ClassroomResponse> searchClassrooms(String keyword) {
        return classroomRepository.searchByKeyword(keyword).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public ClassroomResponse updateClassroom(Long id, ClassroomRequest request) {
        Classroom classroom = classroomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + id));
        
        // Check if current user is the teacher of this classroom
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You can only update your own classrooms");
        }
        
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + request.getSubjectId()));
        
        classroom.setName(request.getName());
        classroom.setGradeLevel(request.getGradeLevel());
        classroom.setSchoolYear(request.getSchoolYear());
        classroom.setDescription(request.getDescription());
        classroom.setSubject(subject);
        
        Classroom updatedClassroom = classroomRepository.save(classroom);
        return mapToResponse(updatedClassroom);
    }
    
    @Transactional
    public void deleteClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + id));
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You can only delete your own classrooms");
        }
        
        classroom.setIsActive(false);
        classroomRepository.save(classroom);
    }
    
    @Transactional
    public StudentInClassResponse addStudent(Long classroomId, AddStudentRequest request) {
        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + classroomId));
        
        Account student = accountRepository.findById(request.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));
        
        if (student.getRole() != Role.CUSTOMER) {
            throw new RuntimeException("Only students (CUSTOMER role) can be added to classrooms");
        }
        
        // Check if student is already ACTIVE in this classroom
        if (classStudentRepository.existsByClassroomIdAndStudentIdAndIsActive(classroomId, request.getStudentId(), true)) {
            throw new RuntimeException("Student already enrolled in this classroom");
        }
        
        // Check if there's an inactive record - reactivate it
        Optional<ClassStudent> existingRecord = classStudentRepository
            .findByClassroomIdAndStudentId(classroomId, request.getStudentId());
        
        ClassStudent classStudent;
        if (existingRecord.isPresent()) {
            // Reactivate existing record
            classStudent = existingRecord.get();
            classStudent.setIsActive(true);
        } else {
            // Create new record
            classStudent = new ClassStudent(classroom, student);
            classStudent.setIsActive(true);
        }
        
        ClassStudent saved = classStudentRepository.save(classStudent);
        return mapToStudentResponse(saved);
    }
    
    @Transactional
    public void removeStudent(Long classroomId, Long studentId) {
        ClassStudent classStudent = classStudentRepository
            .findByClassroomIdAndStudentId(classroomId, studentId)
            .orElseThrow(() -> new RuntimeException("Student not found in this classroom"));
        
        classStudent.setIsActive(false);
        classStudentRepository.save(classStudent);
    }
    
    public List<StudentInClassResponse> getStudentsInClassroom(Long classroomId) {
        return classStudentRepository.findActiveStudentsByClassroomId(classroomId).stream()
            .map(this::mapToStudentResponse)
            .collect(Collectors.toList());
    }
    
    private ClassroomResponse mapToResponse(Classroom classroom) {
        ClassroomResponse response = new ClassroomResponse();
        response.setId(classroom.getId());
        response.setName(classroom.getName());
        response.setGradeLevel(classroom.getGradeLevel());
        response.setSchoolYear(classroom.getSchoolYear());
        response.setDescription(classroom.getDescription());
        response.setIsActive(classroom.getIsActive());
        response.setTeacherId(classroom.getTeacher().getId());
        response.setTeacherName(classroom.getTeacher().getFullName());
        response.setSubjectId(classroom.getSubject().getId());
        response.setSubjectName(classroom.getSubject().getName());
        response.setStudentCount((int) classStudentRepository.countByClassroomIdAndIsActive(classroom.getId(), true));
        response.setCreatedAt(classroom.getCreatedAt());
        response.setUpdatedAt(classroom.getUpdatedAt());
        return response;
    }
    
    private StudentInClassResponse mapToStudentResponse(ClassStudent classStudent) {
        StudentInClassResponse response = new StudentInClassResponse();
        response.setId(classStudent.getId());
        response.setStudentId(classStudent.getStudent().getId());
        response.setUsername(classStudent.getStudent().getUsername());
        response.setFullName(classStudent.getStudent().getFullName());
        response.setEmail(classStudent.getStudent().getEmail());
        response.setEnrolledAt(classStudent.getEnrolledAt());
        response.setIsActive(classStudent.getIsActive());
        return response;
    }
}
