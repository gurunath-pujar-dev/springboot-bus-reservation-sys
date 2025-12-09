package com.reservation.BusService.Model.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "routes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"from_location", "to_location"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "From location is required")
    @Column(name = "from_location", nullable = false, length = 100)
    private String fromLocation;

    @NotBlank(message = "To location is required")
    @Column(name = "to_location", nullable = false, length = 100)
    private String toLocation;

    @Column(name = "distance_km")
    private Integer distanceKm;

    @Column(name = "duration_of_travel_minutes")
    private Integer durationOfTravelMinutes;

    @NotNull(message = "Price is required")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Schedule> schedules;
}