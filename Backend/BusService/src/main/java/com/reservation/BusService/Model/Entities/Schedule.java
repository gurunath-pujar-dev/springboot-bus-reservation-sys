package com.reservation.BusService.Model.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false, foreignKey = @ForeignKey(name = "FK_schedule_bus"))
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false, foreignKey = @ForeignKey(name = "FK_schedule_route"))
    private Route route;

    @NotNull(message = "Travel date is required")
    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @NotNull(message = "Departure time is required")
    @Column(name = "departure", nullable = false)
    private LocalTime departure;

    @NotNull(message = "Arrival time is required")
    @Column(name = "arrival", nullable = false)
    private LocalTime arrival;

    @Min(value = 0, message = "Available seats cannot be negative")
    @Column(name = "available_seats", columnDefinition = "INT DEFAULT 0")
    private Integer availableSeats = 0;
}