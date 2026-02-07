package com.alice.education.dto;

public class AuthResponse {
    
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private AccountResponse account;
    private String message;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, String refreshToken, AccountResponse account) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.account = account;
    }
    
    public AuthResponse(String message) {
        this.message = message;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public AccountResponse getAccount() {
        return account;
    }
    
    public void setAccount(AccountResponse account) {
        this.account = account;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
