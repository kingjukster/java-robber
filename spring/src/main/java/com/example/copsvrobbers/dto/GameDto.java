package com.example.copsvrobbers.dto;

public class GameDto {
    private String message;
    public GameDto() {}
    public GameDto(String message) { this.message = message; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
