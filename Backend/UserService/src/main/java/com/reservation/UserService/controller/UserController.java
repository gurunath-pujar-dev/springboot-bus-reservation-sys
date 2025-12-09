package com.reservation.UserService.controller;

import com.reservation.UserService.dto.UpdateUserProfileRequest;
import com.reservation.UserService.dto.UserProfileResponse;
import com.reservation.UserService.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication) {
        // Authentication object contains the authenticated user details
        String email = authentication.getName(); // Gets email from JWT
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequest updateRequest) {

        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateUserProfile(email, updateRequest));
    }


}