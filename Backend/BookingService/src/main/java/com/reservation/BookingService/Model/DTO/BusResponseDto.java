package com.reservation.BookingService.Model.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BusResponseDto {
    private Long id;
    private String busName;
    private String busNumber;
    private String busType;
    private Integer totalSeats;

    // Constructors

}
