package com.reservation.BookingService.Model.DAO.service;


import com.reservation.BookingService.Model.DTO.BookingRequestDto;
import com.reservation.BookingService.Model.DTO.BookingResponseDto;
import com.reservation.BookingService.Model.DTO.CancellationResponseDto;
import com.reservation.BookingService.Model.DTO.PassengerResponseDto;

import java.util.List;

public interface BookingService {
    BookingResponseDto createBooking(BookingRequestDto bookingRequest, Long userId);

    CancellationResponseDto cancelBooking(Long bookingId, Long userId);
    List<BookingResponseDto> getAllBookings();
    List<BookingResponseDto> getUserBookings(Long userId);
    List<BookingResponseDto> getUpcomingJourneys(Long userId);
    boolean hasActiveBookingsByScheduleId(Long scheduleId);
    List<PassengerResponseDto> getPassengersByScheduleId(Long scheduleId);
}