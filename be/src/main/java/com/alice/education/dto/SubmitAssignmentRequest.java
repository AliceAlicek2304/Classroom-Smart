package com.alice.education.dto;

import java.util.List;

public class SubmitAssignmentRequest {

    private List<SubmissionAnswerRequest> answers;

    public List<SubmissionAnswerRequest> getAnswers() { return answers; }
    public void setAnswers(List<SubmissionAnswerRequest> answers) { this.answers = answers; }
}
