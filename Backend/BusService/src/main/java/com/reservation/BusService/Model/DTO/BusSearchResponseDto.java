package com.reservation.BusService.Model.DTO;


import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BusSearchResponseDto {
    private Long scheduleId;
    private String busName;
    private String busNumber;
    private String busType;
    private Integer totalSeats;
    private String fromLocation;
    private String toLocation;
    private Integer distanceKm;
    private Integer durationOfTravelMinutes;
    private BigDecimal price;
    private LocalDate travelDate;
    private LocalTime departure;
    private LocalTime arrival;
    private Integer availableSeats;
}