package com.reservation.BookingService.Model.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cancellation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cancellation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "cancel_date")
    private LocalDateTime cancelDate = LocalDateTime.now();

    @Column(name = "refund_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount;


    public Cancellation(Booking booking, Long userId, BigDecimal refundAmount) {
        this.booking = booking;
        this.userId = userId;
        this.refundAmount = refundAmount;
        this.cancelDate = LocalDateTime.now();
    }
}