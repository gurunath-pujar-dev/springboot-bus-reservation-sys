package com.reservation.UserService.service;


import com.reservation.UserService.dto.AuthResponse;
import com.reservation.UserService.dto.LoginRequest;
import com.reservation.UserService.dto.RegisterRequest;
import com.reservation.UserService.entity.User;
import com.reservation.UserService.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;


    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword())); //password encoded using Bcrypt passwordEncoder
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setRole(User.Role.USER);

        userRepository.save(user);
    }


    public AuthResponse authenticate(LoginRequest request) {
        // This internally calls:
        // 1. CustomUserDetailsService.loadUserByUsername()
        // 2. PasswordEncoder.matches() to verify password
        // 3. If authentication fails → BadCredentialsException
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        //b. If authentication successful, load user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // c. Generate JWT token
        String jwtToken = jwtService.generateToken(user);

        return new AuthResponse(jwtToken, user.getEmail(), user.getFullName(), user.getRole().name(), "Login Successful", String.valueOf(user.getUserId()));
    }
}