package com.reservation.BookingService.Model.DTO;

import com.reservation.BookingService.Model.Entities.Enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDto {
    private Long id;
    private Long userId;
    private Long scheduleId;
    private LocalDateTime bookingTime;
    private BigDecimal totalAmount;
    private Integer noOfSeats;
    private BookingStatus status;
    private List<PassengerResponseDto> passengers;
    private ScheduleResponseDto schedule;

    // Constructors

}
