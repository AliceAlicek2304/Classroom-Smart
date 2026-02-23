package com.alice.education.dto;

public class AIGenerateRequest {

    private String prompt;
    private int numQuestions = 5;

    public AIGenerateRequest() {}

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public int getNumQuestions() { return numQuestions; }
    public void setNumQuestions(int numQuestions) { this.numQuestions = numQuestions; }
}
