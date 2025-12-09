package com.reservation.BookingService.Model.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequestDto {
    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @NotNull(message = "Number of seats is required")
    @Positive(message = "Number of seats must be positive")
    private Integer noOfSeats;

    @Valid
    @NotNull(message = "Passenger details are required")
    private List<PassengerRequestDto> passengers;


}
