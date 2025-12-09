package com.reservation.BusService.Model.DTO;



import lombok.Data;

import java.math.BigDecimal;

@Data
public class RouteResponseDto {
    private Long id;
    private String fromLocation;
    private String toLocation;
    private Integer distanceKm;
    private Integer durationOfTravelMinutes;
    private BigDecimal price;
}