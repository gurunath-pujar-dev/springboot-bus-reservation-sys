package com.reservation.BusService.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "booking-service")
public interface BookingServiceClient {

    @GetMapping("/api/bookings/check-schedule/{scheduleId}")
    ResponseEntity<Boolean> hasActiveBookings(@PathVariable("scheduleId") Long scheduleId);
}
