package com.reservation.BookingService.Model.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RouteResponseDto {
    private Long id;
    private String fromLocation;
    private String toLocation;
    private Integer distanceKm;
    private Integer durationOfTravelMinutes;
    private BigDecimal price;
}