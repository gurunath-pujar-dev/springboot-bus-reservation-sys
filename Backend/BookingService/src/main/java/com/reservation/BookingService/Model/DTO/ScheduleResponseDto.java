package com.reservation.BookingService.Model.DTO;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
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