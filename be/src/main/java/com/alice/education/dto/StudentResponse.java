package com.alice.education.dto;

import java.time.LocalDate;

public class StudentResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private LocalDate birthDay;
    private Boolean isActive;
    
    public StudentResponse() {}
    
    public StudentResponse(Long id, String username, String fullName, String email, LocalDate birthDay, Boolean isActive) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.birthDay = birthDay;
        this.isActive = isActive;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public LocalDate getBirthDay() {
        return birthDay;
    }
    
    public void setBirthDay(LocalDate birthDay) {
        this.birthDay = birthDay;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
