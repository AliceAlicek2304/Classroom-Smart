package com.alice.education.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.dto.AssignmentRequest;
import com.alice.education.dto.AssignmentResponse;
import com.alice.education.dto.QuestionResponse;
import com.alice.education.model.Account;
import com.alice.education.model.Assignment;
import com.alice.education.model.Classroom;
import com.alice.education.model.Question;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.AssignmentRepository;
import com.alice.education.repository.AssignmentSubmissionRepository;
import com.alice.education.repository.ClassroomRepository;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        if (request.getDueDate() != null && !request.getDueDate().isBlank()) {
            assignment.setDueDate(LocalDateTime.parse(request.getDueDate()));
        }
        assignment.setIsActive(true);
        assignment.setTeacher(teacher);

        // Link classrooms
        if (request.getClassroomIds() != null) {
            Set<Classroom> classrooms = new HashSet<>(
                    classroomRepository.findAllById(request.getClassroomIds()));
            assignment.setClassrooms(classrooms);
        }

        // Build questions
        if (request.getQuestions() != null) {
            List<Question> questions = new ArrayList<>();
            int order = 1;
            for (var qReq : request.getQuestions()) {
                Question q = new Question();
                q.setContent(qReq.getContent());
                q.setOptionA(qReq.getOptionA());
                q.setOptionB(qReq.getOptionB());
                q.setOptionC(qReq.getOptionC());
                q.setOptionD(qReq.getOptionD());
                q.setCorrectAnswer(qReq.getCorrectAnswer());
                q.setOrderNumber(qReq.getOrderNumber() != null ? qReq.getOrderNumber() : order);
                q.setAssignment(assignment);
                questions.add(q);
                order++;
            }
            assignment.setQuestions(questions);
        }

        Assignment saved = assignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
        // Hide correct answers for students
        boolean isStudent = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        return mapToResponse(assignment, !isStudent);
    }

    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AssignmentResponse> getMyAssignments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return assignmentRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AssignmentResponse> getAssignmentsByClassroom(Long classroomId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return assignmentRepository.findByClassroomsId(classroomId).stream()
                .map(a -> {
                    AssignmentResponse res = mapToResponse(a, false); // hide answers for students
                    res.setHasSubmitted(submissionRepository.existsByAssignment_IdAndStudent_Username(a.getId(), username));
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentResponse updateAssignment(Long id, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        if (request.getDueDate() != null && !request.getDueDate().isBlank()) {
            assignment.setDueDate(LocalDateTime.parse(request.getDueDate()));
        }

        if (request.getClassroomIds() != null) {
            Set<Classroom> classrooms = new HashSet<>(
                    classroomRepository.findAllById(request.getClassroomIds()));
            assignment.setClassrooms(classrooms);
        }

        // Replace questions
        assignment.getQuestions().clear();
        if (request.getQuestions() != null) {
            int order = 1;
            for (var qReq : request.getQuestions()) {
                Question q = new Question();
                q.setContent(qReq.getContent());
                q.setOptionA(qReq.getOptionA());
                q.setOptionB(qReq.getOptionB());
                q.setOptionC(qReq.getOptionC());
                q.setOptionD(qReq.getOptionD());
                q.setCorrectAnswer(qReq.getCorrectAnswer());
                q.setOrderNumber(qReq.getOrderNumber() != null ? qReq.getOrderNumber() : order);
                q.setAssignment(assignment);
                assignment.getQuestions().add(q);
                order++;
            }
        }

        Assignment updated = assignmentRepository.save(assignment);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new RuntimeException("Assignment not found with id: " + id);
        }
        assignmentRepository.deleteById(id);
    }

    @Transactional
    public AssignmentResponse toggleActive(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
        assignment.setIsActive(!assignment.getIsActive());
        return mapToResponse(assignmentRepository.save(assignment));
    }

    private AssignmentResponse mapToResponse(Assignment a) {
        return mapToResponse(a, true);
    }

    private AssignmentResponse mapToResponse(Assignment a, boolean includeAnswers) {
        AssignmentResponse res = new AssignmentResponse();
        res.setId(a.getId());
        res.setTitle(a.getTitle());
        res.setDescription(a.getDescription());
        res.setDueDate(a.getDueDate());
        res.setIsActive(a.getIsActive());
        res.setCreatedAt(a.getCreatedAt());
        res.setUpdatedAt(a.getUpdatedAt());

        if (a.getTeacher() != null) {
            res.setTeacherId(a.getTeacher().getId());
            res.setTeacherName(a.getTeacher().getFullName());
        }

        if (a.getClassrooms() != null) {
            res.setClassroomIds(a.getClassrooms().stream()
                    .map(c -> c.getId()).collect(Collectors.toList()));
            res.setClassroomNames(a.getClassrooms().stream()
                    .map(c -> c.getName()).collect(Collectors.toList()));
        }

        List<QuestionResponse> qList = a.getQuestions().stream().map(q -> {
            QuestionResponse qr = new QuestionResponse();
            qr.setId(q.getId());
            qr.setContent(q.getContent());
            qr.setOptionA(q.getOptionA());
            qr.setOptionB(q.getOptionB());
            qr.setOptionC(q.getOptionC());
            qr.setOptionD(q.getOptionD());
            if (includeAnswers) qr.setCorrectAnswer(q.getCorrectAnswer());
            qr.setOrderNumber(q.getOrderNumber());
            return qr;
        }).collect(Collectors.toList());

        res.setQuestions(qList);
        res.setTotalQuestions(qList.size());
        return res;
    }
}
