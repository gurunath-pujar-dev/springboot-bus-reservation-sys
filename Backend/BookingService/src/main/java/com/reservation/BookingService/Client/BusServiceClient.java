package com.reservation.BookingService.Client;


import com.reservation.BookingService.Model.DTO.ScheduleResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "bus-service")
public interface BusServiceClient {

    @GetMapping("/api/schedules/{id}")
    ResponseEntity<ScheduleResponseDto> getScheduleById(@PathVariable Long id);

    @PutMapping("/api/schedules/{id}/seats")
    ResponseEntity<Void> updateAvailableSeats(@PathVariable Long id, @RequestParam Integer seats);
}