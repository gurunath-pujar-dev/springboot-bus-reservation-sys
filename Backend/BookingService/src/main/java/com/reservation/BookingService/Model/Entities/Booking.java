package com.reservation.BookingService.Model.Entities;

import com.reservation.BookingService.Model.Entities.Enums.BookingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "booking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Column(name = "booking_time")
    private LocalDateTime bookingTime = LocalDateTime.now();

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "no_of_seats", nullable = false)
    private Integer noOfSeats;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookingStatus status = BookingStatus.CONFIRMED;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Passenger> passengers;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Cancellation cancellation;

    public Booking(Long userId, @NotNull(message = "Schedule ID is required") Long scheduleId, BigDecimal totalAmount, @NotNull(message = "Number of seats is required") @Positive(message = "Number of seats must be positive") Integer noOfSeats) {
        this.userId = userId;
        this.scheduleId = scheduleId;
        this.totalAmount = totalAmount;
        this.noOfSeats = noOfSeats;
    }

    // Constructors

}