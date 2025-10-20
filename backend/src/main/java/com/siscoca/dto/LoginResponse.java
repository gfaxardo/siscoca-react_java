package com.siscoca.dto;

public class LoginResponse {
    
    private boolean success;
    private String accessToken;
    private UserDto user;
    private String message;
    private long expiresIn;
    
    // Constructors
    public LoginResponse() {}
    
    public LoginResponse(boolean success, String accessToken, UserDto user, long expiresIn) {
        this.success = success;
        this.accessToken = accessToken;
        this.user = user;
        this.expiresIn = expiresIn;
    }
    
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public UserDto getUser() {
        return user;
    }
    
    public void setUser(UserDto user) {
        this.user = user;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
