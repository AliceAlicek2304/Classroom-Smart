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

import com.alice.education.dto.ExamRequest;
import com.alice.education.dto.ExamResponse;
import com.alice.education.dto.QuestionResponse;
import com.alice.education.model.Account;
import com.alice.education.model.Classroom;
import com.alice.education.model.Exam;
import com.alice.education.model.Question;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.ClassroomRepository;
import com.alice.education.repository.ExamRepository;
import com.alice.education.repository.ExamSubmissionRepository;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private ExamSubmissionRepository examSubmissionRepository;

    @Transactional
    public ExamResponse createExam(ExamRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setExamType(request.getExamType());
        exam.setDuration(resolveDuration(request.getExamType(), request.getDuration()));
        if (request.getDueDate() != null && !request.getDueDate().isBlank()) {
            exam.setDueDate(LocalDateTime.parse(request.getDueDate()));
        }
        exam.setIsActive(true);
        exam.setTeacher(teacher);

        if (request.getClassroomIds() != null) {
            Set<Classroom> classrooms = new HashSet<>(
                    classroomRepository.findAllById(request.getClassroomIds()));
            exam.setClassrooms(classrooms);
        }

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
                q.setExam(exam);
                questions.add(q);
                order++;
            }
            exam.setQuestions(questions);
        }

        Exam saved = examRepository.save(exam);
        return mapToResponse(saved);
    }

    public ExamResponse getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        // Hide correct answers for students
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isStudent = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        return mapToResponse(exam, !isStudent);
    }

    public List<ExamResponse> getAllExams() {
        return examRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExamResponse> getMyExams() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account teacher = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return examRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExamResponse> getExamsByClassroom(Long classroomId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return examRepository.findByClassroomsId(classroomId).stream().map(e -> {
            // Always hide answers for student (classroom view)
            ExamResponse res = mapToResponse(e, false);
            res.setHasSubmitted(examSubmissionRepository.existsByExam_IdAndStudent_Username(e.getId(), username));
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional
    public ExamResponse updateExam(Long id, ExamRequest request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setExamType(request.getExamType());
        exam.setDuration(resolveDuration(request.getExamType(), request.getDuration()));
        if (request.getDueDate() != null && !request.getDueDate().isBlank()) {
            exam.setDueDate(LocalDateTime.parse(request.getDueDate()));
        }

        if (request.getClassroomIds() != null) {
            Set<Classroom> classrooms = new HashSet<>(
                    classroomRepository.findAllById(request.getClassroomIds()));
            exam.setClassrooms(classrooms);
        }

        exam.getQuestions().clear();
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
                q.setExam(exam);
                exam.getQuestions().add(q);
                order++;
            }
        }

        Exam updated = examRepository.save(exam);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteExam(Long id) {
        if (!examRepository.existsById(id)) {
            throw new RuntimeException("Exam not found with id: " + id);
        }
        examRepository.deleteById(id);
    }

    @Transactional
    public ExamResponse toggleActive(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        exam.setIsActive(!exam.getIsActive());
        return mapToResponse(examRepository.save(exam));
    }

    private int resolveDuration(com.alice.education.model.GradeType type, Integer fallback) {
        if (type == null) return fallback != null ? fallback : 45;
        return switch (type) {
            case QUIZ_15 -> 15;
            case TEST_45 -> 45;
            case MIDTERM -> 90;
            case FINAL -> 120;
        };
    }

    private ExamResponse mapToResponse(Exam e) {
        return mapToResponse(e, true);
    }

    private ExamResponse mapToResponse(Exam e, boolean includeAnswers) {
        ExamResponse res = new ExamResponse();
        res.setId(e.getId());
        res.setTitle(e.getTitle());
        res.setDescription(e.getDescription());
        res.setDueDate(e.getDueDate());
        res.setDuration(e.getDuration());
        res.setExamType(e.getExamType());
        res.setIsActive(e.getIsActive());
        res.setCreatedAt(e.getCreatedAt());
        res.setUpdatedAt(e.getUpdatedAt());

        if (e.getTeacher() != null) {
            res.setTeacherId(e.getTeacher().getId());
            res.setTeacherName(e.getTeacher().getFullName());
        }

        if (e.getClassrooms() != null) {
            res.setClassroomIds(e.getClassrooms().stream()
                    .map(c -> c.getId()).collect(Collectors.toList()));
            res.setClassroomNames(e.getClassrooms().stream()
                    .map(c -> c.getName()).collect(Collectors.toList()));
        }

        List<QuestionResponse> qList = e.getQuestions().stream().map(q -> {
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
