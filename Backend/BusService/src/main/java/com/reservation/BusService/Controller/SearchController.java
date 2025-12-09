package com.reservation.BusService.Controller;


import com.reservation.BusService.Model.DAO.Services.ScheduleService;
import com.reservation.BusService.Model.DTO.ApiResponse;
import com.reservation.BusService.Model.DTO.BusSearchResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BusSearchResponseDto>>> searchBuses(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<BusSearchResponseDto> availableBuses;

        if (date != null) {
            availableBuses = scheduleService.searchBuses(source.toLowerCase().trim(), destination.toLowerCase().trim(), date);
            if (availableBuses.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success("No buses available for the specified route and date", availableBuses));
            }
            return ResponseEntity.ok(ApiResponse.success("Available buses found", availableBuses));
        } else {
            availableBuses = scheduleService.searchBusesByRoute(source.toLowerCase().trim(), destination.toLowerCase().trim());
            if (availableBuses.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success("No buses available for the specified route", availableBuses));
            }
            return ResponseEntity.ok(ApiResponse.success("Available buses found for route", availableBuses));
        }
    }
}







