package com.reservation.BusService.Controller;

import com.reservation.BusService.Model.DAO.Services.ScheduleService;
import com.reservation.BusService.Model.DTO.ApiResponse;
import com.reservation.BusService.Model.DTO.ScheduleRequestDto;
import com.reservation.BusService.Model.DTO.ScheduleResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponseDto>> createSchedule(@Valid @RequestBody ScheduleRequestDto scheduleRequestDto) {
        ScheduleResponseDto createdSchedule = scheduleService.createSchedule(scheduleRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Schedule created successfully", createdSchedule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponseDto>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequestDto scheduleRequestDto) {
        ScheduleResponseDto updatedSchedule = scheduleService.updateSchedule(id, scheduleRequestDto);
        return ResponseEntity.ok(ApiResponse.success("Schedule updated successfully", updatedSchedule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted successfully", null));
    }

    @PutMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<Void>> updateAvailableSeats(
            @PathVariable Long id,
            @RequestParam Integer seats) {
        scheduleService.updateAvailableSeats(id, seats);
        return ResponseEntity.ok(ApiResponse.success("Seats updated successfully", null));

    }


    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponseDto> getScheduleById(@PathVariable Long id) {
        ScheduleResponseDto schedule = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(schedule);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponseDto>>> getAllSchedules() {
        List<ScheduleResponseDto> schedules = scheduleService.getAllSchedules();
        return ResponseEntity.ok(ApiResponse.success("Schedules retrieved successfully", schedules));
    }
}