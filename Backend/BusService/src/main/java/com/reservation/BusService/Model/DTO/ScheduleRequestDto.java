package com.reservation.BusService.Model.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ScheduleRequestDto {
    @NotNull(message = "Bus ID is required")
    private Long busId;

    @NotNull(message = "Route ID is required")
    private Long routeId;

    @NotNull(message = "Travel date is required")
    private LocalDate travelDate;

    @NotNull(message = "Departure time is required")
    private LocalTime departure;

    @NotNull(message = "Arrival time is required")
    private LocalTime arrival;

    @Min(value = 0, message = "Available seats cannot be negative")
    private Integer availableSeats = 0;
}