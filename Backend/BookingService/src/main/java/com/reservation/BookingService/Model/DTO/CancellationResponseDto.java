package com.reservation.BookingService.Model.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancellationResponseDto {
    private Long id;
    private Long bookingId;
    private Long userId;
    private LocalDateTime cancelDate;
    private BigDecimal refundAmount;
    private String message;
    private BigDecimal refundPercent;

}
