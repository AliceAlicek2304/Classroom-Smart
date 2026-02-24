package com.alice.education.dto;

public class SubmissionAnswerRequest {

    private Long questionId;
    private String selectedAnswer; // "A","B","C","D" or null nếu bỏ qua

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public String getSelectedAnswer() { return selectedAnswer; }
    public void setSelectedAnswer(String selectedAnswer) { this.selectedAnswer = selectedAnswer; }
}
