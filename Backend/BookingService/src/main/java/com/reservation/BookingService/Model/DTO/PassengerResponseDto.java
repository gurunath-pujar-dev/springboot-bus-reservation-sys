package com.reservation.BookingService.Model.DTO;


import com.reservation.BookingService.Model.Entities.Enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class PassengerResponseDto {
    private Long passengerId;
    private String passengerName;
    private Integer age;
    private Gender gender;
    private Integer seatNumber;

}