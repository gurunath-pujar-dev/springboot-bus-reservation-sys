package com.reservation.BookingService.Model.Entities;


import com.reservation.BookingService.Model.Entities.Enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "passengers", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"booking_id", "seat_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "passenger_id")
    private Long passengerId;

    @Column(name = "passenger_name", nullable = false, length = 100)
    private String passengerName;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;


    public Passenger(@NotBlank(message = "Passenger name is required") @Size(max = 100, message = "Passenger name must not exceed 100 characters") String passengerName, @NotNull(message = "Age is required") @Min(value = 0, message = "Age must be between 0 and 120") @Max(value = 120, message = "Age must be between 0 and 120") Integer age, @NotNull(message = "Gender is required") Gender gender, Integer seatNumber) {
        this.passengerName = passengerName;
        this.age = age;
        this.gender = gender;
        this.seatNumber = seatNumber;
    }
}
