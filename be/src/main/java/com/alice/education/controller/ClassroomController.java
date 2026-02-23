package com.alice.education.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alice.education.dto.AddStudentRequest;
import com.alice.education.dto.ApiResponse;
import com.alice.education.dto.ClassroomRequest;
import com.alice.education.dto.ClassroomResponse;
import com.alice.education.dto.EnrollRequest;
import com.alice.education.dto.StudentInClassResponse;
import com.alice.education.service.ClassroomService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ClassroomController {
    
    @Autowired
    private ClassroomService classroomService;
    
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> createClassroom(@Valid @RequestBody ClassroomRequest request) {
        try {
            ClassroomResponse response = classroomService.createClassroom(request);
            return ApiResponse.success("Classroom created successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> getClassroomById(@PathVariable Long id) {
        try {
            ClassroomResponse response = classroomService.getClassroomById(id);
            return ApiResponse.success("Classroom retrieved successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getAllClassrooms() {
        try {
            List<ClassroomResponse> responses = classroomService.getAllClassrooms();
            return ApiResponse.success("Classrooms retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/my-classrooms")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getMyClassrooms() {
        try {
            List<ClassroomResponse> responses = classroomService.getMyClassrooms();
            return ApiResponse.success("My classrooms retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getClassroomsBySubject(@PathVariable Long subjectId) {
        try {
            List<ClassroomResponse> responses = classroomService.getClassroomsBySubject(subjectId);
            return ApiResponse.success("Classrooms retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> searchClassrooms(@RequestParam String keyword) {
        try {
            List<ClassroomResponse> responses = classroomService.searchClassrooms(keyword);
            return ApiResponse.success("Search results retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> updateClassroom(
            @PathVariable Long id, 
            @Valid @RequestBody ClassroomRequest request) {
        try {
            ClassroomResponse response = classroomService.updateClassroom(id, request);
            return ApiResponse.success("Classroom updated successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteClassroom(@PathVariable Long id) {
        try {
            classroomService.deleteClassroom(id);
            return ApiResponse.success("Classroom deleted successfully", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @PostMapping("/{classroomId}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<StudentInClassResponse>> addStudent(
            @PathVariable Long classroomId,
            @Valid @RequestBody AddStudentRequest request) {
        try {
            StudentInClassResponse response = classroomService.addStudent(classroomId, request);
            return ApiResponse.success("Student added to classroom successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{classroomId}/students/{studentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> removeStudent(
            @PathVariable Long classroomId,
            @PathVariable Long studentId) {
        try {
            classroomService.removeStudent(classroomId, studentId);
            return ApiResponse.success("Student removed from classroom successfully", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    @GetMapping("/{classroomId}/students")
    @PreAuthorize("hasAnyRole('TEACHER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<StudentInClassResponse>>> getStudentsInClassroom(@PathVariable Long classroomId) {
        try {
            List<StudentInClassResponse> responses = classroomService.getStudentsInClassroom(classroomId);
            return ApiResponse.success("Students retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{classroomId}/enroll")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<StudentInClassResponse>> enrollWithPassword(
            @PathVariable Long classroomId,
            @RequestBody EnrollRequest request) {
        try {
            StudentInClassResponse response = classroomService.enrollWithPassword(classroomId, request.getPassword());
            return ApiResponse.success("Enrolled successfully", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/enrolled")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getEnrolledClassrooms() {
        try {
            List<ClassroomResponse> responses = classroomService.getEnrolledClassrooms();
            return ApiResponse.success("Enrolled classrooms retrieved successfully", responses);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
