package com.alice.education.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.education.dto.SubmissionAnswerRequest;
import com.alice.education.dto.SubmissionAnswerResult;
import com.alice.education.dto.SubmissionResponse;
import com.alice.education.dto.SubmitAssignmentRequest;
import com.alice.education.model.Account;
import com.alice.education.model.Assignment;
import com.alice.education.model.AssignmentSubmission;
import com.alice.education.model.Question;
import com.alice.education.model.SubmissionAnswer;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.AssignmentRepository;
import com.alice.education.repository.AssignmentSubmissionRepository;
import com.alice.education.repository.ClassStudentRepository;

@Service
public class AssignmentSubmissionService {

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ClassStudentRepository classStudentRepository;

    @Transactional
    public SubmissionResponse submitAssignment(Long assignmentId, SubmitAssignmentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account student = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Bài tập không tồn tại"));

        if (!assignment.getIsActive()) {
            throw new RuntimeException("Bài tập không còn hoạt động");
        }
        if (assignment.getDueDate() != null && LocalDateTime.now().isAfter(assignment.getDueDate())) {
            throw new RuntimeException("Bài tập đã quá hạn nộp");
        }

        // Map questionId -> question for fast lookup
        Map<Long, Question> questionMap = assignment.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setTotalCount(assignment.getQuestions().size());

        List<SubmissionAnswer> answers = new ArrayList<>();
        int correctCount = 0;

        if (request.getAnswers() != null) {
            for (SubmissionAnswerRequest ansReq : request.getAnswers()) {
                Question question = questionMap.get(ansReq.getQuestionId());
                if (question == null) continue;

                SubmissionAnswer ans = new SubmissionAnswer();
                ans.setSubmission(submission);
                ans.setQuestion(question);
                ans.setSelectedAnswer(ansReq.getSelectedAnswer());

                boolean isCorrect = ansReq.getSelectedAnswer() != null
                        && ansReq.getSelectedAnswer().equals(question.getCorrectAnswer());
                ans.setIsCorrect(isCorrect);
                if (isCorrect) correctCount++;
                answers.add(ans);
            }
        }

        submission.setCorrectCount(correctCount);
        int total = assignment.getQuestions().size();
        double score = total > 0 ? Math.round((double) correctCount / total * 10 * 100.0) / 100.0 : 0.0;
        submission.setScore(score);
        submission.setAnswers(answers);

        AssignmentSubmission saved = submissionRepository.save(submission);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getAllSubmissionsForAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Set<Long> assignmentClassroomIds = assignment.getClassrooms().stream()
                .map(c -> c.getId())
                .collect(Collectors.toSet());

        List<AssignmentSubmission> submissions = submissionRepository
                .findAllByAssignment_IdOrderByCreatedAtDesc(assignmentId);

        return submissions.stream().map(s -> {
            SubmissionResponse res = toResponse(s);
            String classroomName = classStudentRepository.findByStudentId(s.getStudent().getId())
                    .stream()
                    .filter(cs -> assignmentClassroomIds.contains(cs.getClassroom().getId()))
                    .map(cs -> cs.getClassroom().getName())
                    .findFirst()
                    .orElse("—");
            res.setClassroomName(classroomName);
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getMySubmissions(Long assignmentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<AssignmentSubmission> submissions = submissionRepository
                .findAllByAssignment_IdAndStudent_UsernameOrderByCreatedAtDesc(assignmentId, username);
        return submissions.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private SubmissionResponse toResponse(AssignmentSubmission s) {
        SubmissionResponse res = new SubmissionResponse();
        res.setId(s.getId());
        res.setAssignmentId(s.getAssignment().getId());
        res.setAssignmentTitle(s.getAssignment().getTitle());
        res.setStudentId(s.getStudent().getId());
        res.setStudentName(s.getStudent().getFullName());
        res.setCorrectCount(s.getCorrectCount());
        res.setTotalCount(s.getTotalCount());
        res.setScore(s.getScore());
        res.setSubmittedAt(s.getSubmittedAt());
        res.setCreatedAt(s.getCreatedAt());

        List<SubmissionAnswerResult> answerResults = s.getAnswers().stream().map(a -> {
            SubmissionAnswerResult r = new SubmissionAnswerResult();
            r.setQuestionId(a.getQuestion().getId());
            r.setQuestionContent(a.getQuestion().getContent());
            r.setSelectedAnswer(a.getSelectedAnswer());
            r.setCorrectAnswer(a.getQuestion().getCorrectAnswer());
            r.setIsCorrect(a.getIsCorrect());
            return r;
        }).collect(Collectors.toList());

        res.setAnswers(answerResults);
        return res;
    }
}
