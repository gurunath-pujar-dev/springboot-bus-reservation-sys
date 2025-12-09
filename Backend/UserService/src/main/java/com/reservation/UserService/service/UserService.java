package com.reservation.UserService.service;


import com.reservation.UserService.Exceptions.UserNotFoundException;
import com.reservation.UserService.dto.UpdateUserProfileRequest;
import com.reservation.UserService.dto.UserProfileResponse;
import com.reservation.UserService.entity.User;
import com.reservation.UserService.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        return new UserProfileResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }

    public UserProfileResponse updateUserProfile(String email, @Valid UpdateUserProfileRequest updateRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        // Update allowed fields
        if (!updateRequest.getFullName().isBlank()) {
            user.setFullName(updateRequest.getFullName());
        }
        if (!updateRequest.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);

        return new UserProfileResponse(
                updatedUser.getUserId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getPhoneNumber(),
                updatedUser.getRole().name(),
                updatedUser.getCreatedAt()
        );
    }
}