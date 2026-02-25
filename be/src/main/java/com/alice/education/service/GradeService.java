package com.alice.education.service;

import com.alice.education.dto.*;
import com.alice.education.model.*;
import com.alice.education.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GradeService {

    @Autowired
    private GradeColumnRepository gradeColumnRepository;

    @Autowired
    private StudentGradeRepository studentGradeRepository;

    @Autowired
    private ClassStudentRepository classStudentRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ExamSubmissionRepository examSubmissionRepository;

    @Transactional
    public void initializeGradeColumns(Classroom classroom) {
        List<Object[]> defaults = List.of(
            new Object[]{"15p lần 1", GradeType.QUIZ_15, 1},
            new Object[]{"15p lần 2", GradeType.QUIZ_15, 2},
            new Object[]{"15p lần 3", GradeType.QUIZ_15, 3},
            new Object[]{"45p lần 1", GradeType.TEST_45, 4},
            new Object[]{"45p lần 2", GradeType.TEST_45, 5},
            new Object[]{"Giữa kỳ", GradeType.MIDTERM, 6},
            new Object[]{"Cuối kỳ", GradeType.FINAL, 7}
        );
        for (Object[] def : defaults) {
            GradeColumn col = new GradeColumn();
            col.setClassroom(classroom);
            col.setName((String) def[0]);
            col.setType((GradeType) def[1]);
            col.setOrderNumber((Integer) def[2]);
            col.setIsCustom(false);
            gradeColumnRepository.save(col);
        }
    }

    @Transactional
    public void addStudentToGradeBook(Classroom classroom, Account student) {
        List<GradeColumn> columns = gradeColumnRepository.findByClassroomIdOrderByOrderNumber(classroom.getId());
        List<StudentGrade> existing = studentGradeRepository.findByClassroomIdAndStudentId(classroom.getId(), student.getId());
        Set<Long> existingColumnIds = existing.stream()
            .map(sg -> sg.getGradeColumn().getId())
            .collect(Collectors.toSet());

        for (GradeColumn col : columns) {
            if (!existingColumnIds.contains(col.getId())) {
                StudentGrade grade = new StudentGrade();
                grade.setGradeColumn(col);
                grade.setStudent(student);
                grade.setClassroom(classroom);
                grade.setScore(null);
                studentGradeRepository.save(grade);
            }
        }
    }

    @Transactional
    public GradeColumnResponse addCustomColumn(Long classroomId, AddGradeColumnRequest request) {
        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));

        List<GradeColumn> existing = gradeColumnRepository.findByClassroomIdOrderByOrderNumber(classroomId);
        int maxOrder = existing.stream().mapToInt(GradeColumn::getOrderNumber).max().orElse(0);

        GradeColumn col = new GradeColumn();
        col.setClassroom(classroom);
        col.setName(request.getName().trim());
        col.setType(GradeType.valueOf(request.getType()));
        col.setOrderNumber(maxOrder + 1);
        col.setIsCustom(true);
        GradeColumn saved = gradeColumnRepository.save(col);

        List<ClassStudent> classStudents = classStudentRepository.findActiveStudentsByClassroomId(classroomId);
        List<StudentGrade> createdGrades = new ArrayList<>();
        for (ClassStudent cs : classStudents) {
            StudentGrade grade = new StudentGrade();
            grade.setGradeColumn(saved);
            grade.setStudent(cs.getStudent());
            grade.setClassroom(classroom);
            grade.setScore(null);
            createdGrades.add(studentGradeRepository.save(grade));
        }

        // Auto-fill scores from exam submissions if examId provided
        if (request.getExamId() != null) {
            List<ExamSubmission> submissions = examSubmissionRepository
                .findAllByExam_IdOrderByCreatedAtDesc(request.getExamId());
            // Take best score per student
            Map<Long, Double> bestScores = new HashMap<>();
            for (ExamSubmission sub : submissions) {
                Long studentId = sub.getStudent().getId();
                bestScores.merge(studentId, sub.getScore(), Math::max);
            }
            for (StudentGrade grade : createdGrades) {
                Double best = bestScores.get(grade.getStudent().getId());
                if (best != null) {
                    grade.setScore(best);
                    studentGradeRepository.save(grade);
                }
            }
        }

        return mapToColumnResponse(saved);
    }

    @Transactional
    public void deleteCustomColumn(Long columnId) {
        GradeColumn col = gradeColumnRepository.findById(columnId)
            .orElseThrow(() -> new RuntimeException("Grade column not found"));
        if (!Boolean.TRUE.equals(col.getIsCustom())) {
            throw new RuntimeException("Không thể xóa cột điểm mặc định");
        }
        studentGradeRepository.deleteByGradeColumn(col);
        gradeColumnRepository.delete(col);
    }

    @Transactional
    public GradeEntryResponse updateGrade(Long gradeId, UpdateGradeRequest request) {
        StudentGrade grade = studentGradeRepository.findById(gradeId)
            .orElseThrow(() -> new RuntimeException("Grade entry not found"));
        grade.setScore(request.getScore());
        StudentGrade saved = studentGradeRepository.save(grade);
        GradeEntryResponse resp = new GradeEntryResponse();
        resp.setGradeId(saved.getId());
        resp.setColumnId(saved.getGradeColumn().getId());
        resp.setScore(saved.getScore());
        return resp;
    }

    public GradeBookResponse getGradeBook(Long classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));

        List<GradeColumn> columns = gradeColumnRepository.findByClassroomIdOrderByOrderNumber(classroomId);
        List<ClassStudent> classStudents = classStudentRepository.findActiveStudentsByClassroomId(classroomId);

        Map<Long, Map<Long, StudentGrade>> gradeMap = new HashMap<>();
        for (StudentGrade sg : studentGradeRepository.findByClassroomId(classroomId)) {
            gradeMap
                .computeIfAbsent(sg.getStudent().getId(), k -> new HashMap<>())
                .put(sg.getGradeColumn().getId(), sg);
        }

        List<GradeColumnResponse> columnResponses = columns.stream()
            .map(this::mapToColumnResponse)
            .collect(Collectors.toList());

        List<StudentGradeRowResponse> rows = classStudents.stream().map(cs -> {
            Account student = cs.getStudent();
            Map<Long, StudentGrade> studentGrades = gradeMap.getOrDefault(student.getId(), Collections.emptyMap());

            List<GradeEntryResponse> entries = columns.stream().map(col -> {
                GradeEntryResponse entry = new GradeEntryResponse();
                entry.setColumnId(col.getId());
                StudentGrade sg = studentGrades.get(col.getId());
                if (sg != null) {
                    entry.setGradeId(sg.getId());
                    entry.setScore(sg.getScore());
                }
                return entry;
            }).collect(Collectors.toList());

            StudentGradeRowResponse row = new StudentGradeRowResponse();
            row.setStudentId(student.getId());
            row.setStudentName(student.getFullName());
            row.setUsername(student.getUsername());
            row.setGrades(entries);
            return row;
        }).collect(Collectors.toList());

        GradeBookResponse response = new GradeBookResponse();
        response.setClassroomId(classroomId);
        response.setClassroomName(classroom.getName());
        response.setColumns(columnResponses);
        response.setRows(rows);
        return response;
    }

    public GradeBookResponse getMyGradeBook(Long classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account student = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<GradeColumn> columns = gradeColumnRepository.findByClassroomIdOrderByOrderNumber(classroomId);
        List<StudentGrade> myGrades = studentGradeRepository.findByClassroomIdAndStudentId(classroomId, student.getId());
        Map<Long, StudentGrade> gradeByColumnId = myGrades.stream()
            .collect(Collectors.toMap(sg -> sg.getGradeColumn().getId(), sg -> sg));

        List<GradeColumnResponse> columnResponses = columns.stream()
            .map(this::mapToColumnResponse)
            .collect(Collectors.toList());

        List<GradeEntryResponse> entries = columns.stream().map(col -> {
            GradeEntryResponse entry = new GradeEntryResponse();
            entry.setColumnId(col.getId());
            StudentGrade sg = gradeByColumnId.get(col.getId());
            if (sg != null) {
                entry.setGradeId(sg.getId());
                entry.setScore(sg.getScore());
            }
            return entry;
        }).collect(Collectors.toList());

        StudentGradeRowResponse row = new StudentGradeRowResponse();
        row.setStudentId(student.getId());
        row.setStudentName(student.getFullName());
        row.setUsername(student.getUsername());
        row.setGrades(entries);

        GradeBookResponse response = new GradeBookResponse();
        response.setClassroomId(classroomId);
        response.setClassroomName(classroom.getName());
        response.setColumns(columnResponses);
        response.setRows(Collections.singletonList(row));
        return response;
    }

    private GradeColumnResponse mapToColumnResponse(GradeColumn col) {
        GradeColumnResponse r = new GradeColumnResponse();
        r.setId(col.getId());
        r.setName(col.getName());
        r.setType(col.getType().name());
        r.setOrderNumber(col.getOrderNumber());
        r.setIsCustom(col.getIsCustom());
        return r;
    }
}
