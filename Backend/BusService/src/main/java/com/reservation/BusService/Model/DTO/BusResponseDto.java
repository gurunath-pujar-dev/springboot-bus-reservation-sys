package com.reservation.BusService.Model.DTO;



import lombok.Data;

@Data
public class BusResponseDto {
    private Long id;
    private String busName;
    private String busNumber;
    private String busType;
    private Integer totalSeats;
}