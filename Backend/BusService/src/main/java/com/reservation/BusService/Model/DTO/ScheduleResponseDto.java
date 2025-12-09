package com.reservation.BusService.Model.DTO;


import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ScheduleResponseDto {

    private Long id;
    private Long busId;
    private Long routeId;
    private LocalDate travelDate;
    private LocalTime departure;
    private LocalTime arrival;
    private Integer availableSeats;
    private BusResponseDto bus;
    private RouteResponseDto route;
}