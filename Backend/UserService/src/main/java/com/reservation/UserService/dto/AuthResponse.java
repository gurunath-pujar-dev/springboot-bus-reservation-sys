package com.reservation.UserService.dto;
//import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String fullName;
    private String role;
    private String message;
    private String userId;

    public AuthResponse(String token, String email, String fullName, String role, String message, String userId) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.message = message;
        this.userId = userId;
    }

//    public AuthResponse(String message){
//       this.message = message;
//       this.type = null;
//    }
}