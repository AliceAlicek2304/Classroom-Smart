package com.alice.education.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
        classroom.setMeetUrl(generateMeetUrl());
        classroom.setPassword(request.getPassword());
        
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
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            classroom.setPassword(request.getPassword());
        }

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
        response.setMeetUrl(classroom.getMeetUrl());
        response.setCreatedAt(classroom.getCreatedAt());
        response.setUpdatedAt(classroom.getUpdatedAt());
        return response;
    }

    private String generateMeetUrl() {
        String roomId = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return "https://meet.jit.si/classroomsmart-" + roomId;
    }

    public StudentInClassResponse enrollWithPassword(Long classroomId, String password) {
        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!Boolean.TRUE.equals(classroom.getIsActive()))
            throw new RuntimeException("L\u1edbp h\u1ecdc kh\u00f4ng c\u00f2n ho\u1ea1t \u0111\u1ed9ng");

        // N\u1ebfu l\u1edbp c\u00f3 \u0111\u1eb7t m\u1eadt kh\u1ea9u th\u00ec ki\u1ec3m tra, null = m\u1edf (ch\u1ea5p nh\u1eadn m\u1ecdi m\u1eadt kh\u1ea9u)
        if (classroom.getPassword() != null && !classroom.getPassword().equals(password))
            throw new RuntimeException("M\u1eadt kh\u1ea9u l\u1edbp kh\u00f4ng \u0111\u00fang");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account student = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (classStudentRepository.existsByClassroomIdAndStudentIdAndIsActive(classroomId, student.getId(), true))
            throw new RuntimeException("B\u1ea1n \u0111\u00e3 tham gia l\u1edbp h\u1ecdc n\u00e0y");

        Optional<ClassStudent> existing = classStudentRepository.findByClassroomIdAndStudentId(classroomId, student.getId());
        ClassStudent classStudent;
        if (existing.isPresent()) {
            classStudent = existing.get();
            classStudent.setIsActive(true);
        } else {
            classStudent = new ClassStudent(classroom, student);
            classStudent.setIsActive(true);
        }

        return mapToStudentResponse(classStudentRepository.save(classStudent));
    }

    public List<ClassroomResponse> getEnrolledClassrooms() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account student = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return classStudentRepository.findActiveByStudentId(student.getId()).stream()
            .map(cs -> mapToResponse(cs.getClassroom()))
            .collect(Collectors.toList());
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
