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

import com.alice.education.dto.ExamSubmissionResponse;
import com.alice.education.dto.SubmissionAnswerRequest;
import com.alice.education.dto.SubmissionAnswerResult;
import com.alice.education.dto.SubmitExamRequest;
import com.alice.education.model.Account;
import com.alice.education.model.Exam;
import com.alice.education.model.ExamSubmission;
import com.alice.education.model.ExamSubmissionAnswer;
import com.alice.education.model.Question;
import com.alice.education.repository.AccountRepository;
import com.alice.education.repository.ClassStudentRepository;
import com.alice.education.repository.ExamRepository;
import com.alice.education.repository.ExamSubmissionRepository;

@Service
public class ExamSubmissionService {

    @Autowired
    private ExamSubmissionRepository submissionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ClassStudentRepository classStudentRepository;

    @Transactional
    public ExamSubmissionResponse submitExam(Long examId, SubmitExamRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account student = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Bài kiểm tra không tồn tại"));

        if (!exam.getIsActive()) {
            throw new RuntimeException("Bài kiểm tra không còn hoạt động");
        }

        // 1-attempt rule
        if (submissionRepository.existsByExam_IdAndStudent_Username(examId, username)) {
            throw new RuntimeException("Bạn đã nộp bài kiểm tra này rồi");
        }

        // Map questionId -> question for fast lookup
        Map<Long, Question> questionMap = exam.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        ExamSubmission submission = new ExamSubmission();
        submission.setExam(exam);
        submission.setStudent(student);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setTotalCount(exam.getQuestions().size());

        List<ExamSubmissionAnswer> answers = new ArrayList<>();
        int correctCount = 0;

        if (request.getAnswers() != null) {
            for (SubmissionAnswerRequest ansReq : request.getAnswers()) {
                Question question = questionMap.get(ansReq.getQuestionId());
                if (question == null) continue;

                ExamSubmissionAnswer ans = new ExamSubmissionAnswer();
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
        int total = exam.getQuestions().size();
        double score = total > 0 ? Math.round((double) correctCount / total * 10 * 100.0) / 100.0 : 0.0;
        submission.setScore(score);
        submission.setAnswers(answers);

        ExamSubmission saved = submissionRepository.save(submission);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExamSubmissionResponse> getMySubmissions(Long examId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ExamSubmission> submissions = submissionRepository
                .findAllByExam_IdAndStudent_UsernameOrderByCreatedAtDesc(examId, username);
        return submissions.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExamSubmissionResponse> getAllSubmissionsForExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Set<Long> examClassroomIds = exam.getClassrooms().stream()
                .map(c -> c.getId())
                .collect(Collectors.toSet());

        List<ExamSubmission> submissions = submissionRepository
                .findAllByExam_IdOrderByCreatedAtDesc(examId);

        return submissions.stream().map(s -> {
            ExamSubmissionResponse res = toResponse(s);
            String classroomName = classStudentRepository.findByStudentId(s.getStudent().getId())
                    .stream()
                    .filter(cs -> examClassroomIds.contains(cs.getClassroom().getId()))
                    .map(cs -> cs.getClassroom().getName())
                    .findFirst()
                    .orElse("—");
            res.setClassroomName(classroomName);
            return res;
        }).collect(Collectors.toList());
    }

    private ExamSubmissionResponse toResponse(ExamSubmission s) {
        ExamSubmissionResponse res = new ExamSubmissionResponse();
        res.setId(s.getId());
        res.setExamId(s.getExam().getId());
        res.setExamTitle(s.getExam().getTitle());
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
