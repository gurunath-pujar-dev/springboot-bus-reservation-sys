package com.reservation.BookingService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservation.BookingService.Controller.BookingController;
import com.reservation.BookingService.Model.DTO.CancellationResponseDto;
import com.reservation.BookingService.Model.DAO.service.BookingService;

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

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerAdditionalTest {

	@Mock
	private BookingService bookingService;

	@InjectMocks
	private BookingController bookingController;

	private MockMvc mockMvc;
	private ObjectMapper objectMapper;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(bookingController).build();
		objectMapper = new ObjectMapper();
	}

	@Test
	@DisplayName("Test Case 1: Should return true if schedule has active bookings")
	void testHasActiveBookingsTrue() throws Exception {
		when(bookingService.hasActiveBookingsByScheduleId(50L)).thenReturn(true);

		mockMvc.perform(get("/api/bookings/check-schedule/{scheduleId}", 50L)
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));

		verify(bookingService, times(1)).hasActiveBookingsByScheduleId(50L);
	}

	@Test
	@DisplayName("Test Case 2: Should return false if schedule has no active bookings")
	void testHasActiveBookingsFalse() throws Exception {
		when(bookingService.hasActiveBookingsByScheduleId(99L)).thenReturn(false);

		mockMvc.perform(get("/api/bookings/check-schedule/{scheduleId}", 99L)
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));

		verify(bookingService, times(1)).hasActiveBookingsByScheduleId(99L);
	}


}
