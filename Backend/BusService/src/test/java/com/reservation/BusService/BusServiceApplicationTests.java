package com.reservation.BusService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.reservation.BusService.Controller.ScheduleController;
import com.reservation.BusService.Model.DAO.Services.ScheduleService;
import com.reservation.BusService.Model.DTO.ScheduleRequestDto;
import com.reservation.BusService.Model.DTO.ScheduleResponseDto;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;

@ExtendWith(MockitoExtension.class) // Use Mockito for unit testing
class BusServiceApplicationTests {

	@Mock
	private ScheduleService scheduleService;

	@InjectMocks
	private ScheduleController scheduleController;

	private MockMvc mockMvc;
	private ObjectMapper objectMapper;
	private ScheduleRequestDto scheduleRequestDto;
	private ScheduleResponseDto scheduleResponseDto;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(scheduleController).build();
		objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule());

		// Request DTO
		scheduleRequestDto = new ScheduleRequestDto();
		scheduleRequestDto.setBusId(1L);
		scheduleRequestDto.setRouteId(1L);
		scheduleRequestDto.setTravelDate(LocalDate.of(2024, 12, 25));
		scheduleRequestDto.setDeparture(LocalTime.of(9, 30));
		scheduleRequestDto.setArrival(LocalTime.of(14, 30));
		scheduleRequestDto.setAvailableSeats(45);

		// Response DTO
		scheduleResponseDto = new ScheduleResponseDto();
		scheduleResponseDto.setId(10L);
		scheduleResponseDto.setBusId(1L);
		scheduleResponseDto.setRouteId(1L);
		scheduleResponseDto.setTravelDate(LocalDate.of(2024, 12, 25));
		scheduleResponseDto.setDeparture(LocalTime.of(9, 30));
		scheduleResponseDto.setArrival(LocalTime.of(14, 30));
		scheduleResponseDto.setAvailableSeats(45);
	}

	@Test
	@DisplayName("Test Case 1: Should create schedule successfully")
	void testCreateScheduleSuccess() throws Exception {
		// Mock service
		when(scheduleService.createSchedule(any(ScheduleRequestDto.class)))
				.thenReturn(scheduleResponseDto);

		// Perform request
		mockMvc.perform(post("/api/schedules")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(scheduleRequestDto)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.success", is(true)))
				.andExpect(jsonPath("$.message", is("Schedule created successfully")))
				.andExpect(jsonPath("$.data.id", is(10))) // fixed from 1 -> 10
				.andExpect(jsonPath("$.data.busId", is(1)))
				.andExpect(jsonPath("$.data.routeId", is(1)))
				.andExpect(jsonPath("$.data.availableSeats", is(45)));

		verify(scheduleService, times(1)).createSchedule(any(ScheduleRequestDto.class));
	}

	@Test
	@DisplayName("Test Case 2: Should delete schedule by ID successfully")
	void testDeleteScheduleByIdSuccess() throws Exception {
		Long scheduleId = 20L;

		// Mock service call (void method, so doNothing is used)
		doNothing().when(scheduleService).deleteSchedule(scheduleId);

		mockMvc.perform(delete("/api/schedules/{id}", scheduleId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success", is(true)))
				.andExpect(jsonPath("$.message", is("Schedule deleted successfully")))
				.andExpect(jsonPath("$.data").doesNotExist());

		verify(scheduleService, times(1)).deleteSchedule(scheduleId);
	}
}
