package com.reservation.UserService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservation.UserService.controller.AuthController;
import com.reservation.UserService.dto.LoginRequest;
import com.reservation.UserService.dto.RegisterRequest;
import com.reservation.UserService.dto.AuthResponse;
import com.reservation.UserService.service.AuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;

@ExtendWith(MockitoExtension.class) // For Mockito support
class UserServiceApplicationTests{

	@Mock
	private AuthService authService;

	@InjectMocks
	private AuthController authController;

	private MockMvc mockMvc;
	private ObjectMapper objectMapper;

	private RegisterRequest registerRequest;
	private LoginRequest loginRequest;
	private AuthResponse authResponse;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
		objectMapper = new ObjectMapper();

		// sample register request
		registerRequest = new RegisterRequest();
		registerRequest.setFullName("John Doe");
		registerRequest.setEmail("john@example.com");
		registerRequest.setPassword("secret123");
		registerRequest.setPhoneNumber("1234567890");

		// sample login request
		loginRequest = new LoginRequest();
		loginRequest.setEmail("john@example.com");
		loginRequest.setPassword("secret123");

		// sample auth response
		authResponse = new AuthResponse(
				"jwt-token",
				"john@example.com",
				"John Doe",
				"USER",
				"Login successful",
				"user-123"
		);
	}

	@Test
	@DisplayName("Test Case 1: Should register user successfully")
	void testRegisterUserSuccess() throws Exception {
		// Service has void return type → mock as doNothing()
		doNothing().when(authService).register(any(RegisterRequest.class));

		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(registerRequest)))
				.andExpect(status().isCreated())
				.andExpect(content().string("User registered successfully"));

		verify(authService, times(1)).register(any(RegisterRequest.class));
	}

	@Test
	@DisplayName("Test Case 2: Should authenticate user and return token")
	void testLoginUserSuccess() throws Exception {
		when(authService.authenticate(any(LoginRequest.class))).thenReturn(authResponse);

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(loginRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token", is("jwt-token")))
				.andExpect(jsonPath("$.email", is("john@example.com")))
				.andExpect(jsonPath("$.fullName", is("John Doe")))
				.andExpect(jsonPath("$.role", is("USER")))
				.andExpect(jsonPath("$.message", is("Login successful")))
				.andExpect(jsonPath("$.userId", is("user-123")));

		verify(authService, times(1)).authenticate(any(LoginRequest.class));
	}


}
