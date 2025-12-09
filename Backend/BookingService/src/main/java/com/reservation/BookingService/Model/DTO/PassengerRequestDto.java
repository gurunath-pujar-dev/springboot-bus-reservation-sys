package com.reservation.BookingService.Model.DTO;



import com.reservation.BookingService.Model.Entities.Enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PassengerRequestDto {
    @NotBlank(message = "Passenger name is required")
    @Size(max = 100, message = "Passenger name must not exceed 100 characters")
    private String passengerName;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be between 0 and 120")
    @Max(value = 120, message = "Age must be between 0 and 120")
    private Integer age;

    @NotNull(message = "Gender is required")
    private Gender gender;


}