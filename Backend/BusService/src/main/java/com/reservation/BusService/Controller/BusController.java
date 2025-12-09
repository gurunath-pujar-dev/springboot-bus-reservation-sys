package com.reservation.BusService.Controller;


import com.reservation.BusService.Model.DAO.Services.BusService;
import com.reservation.BusService.Model.DTO.ApiResponse;
import com.reservation.BusService.Model.DTO.BusRequestDto;
import com.reservation.BusService.Model.DTO.BusResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bus")
@RequiredArgsConstructor
public class BusController {

    private final BusService busService;

    @PostMapping
    public ResponseEntity<ApiResponse<BusResponseDto>> createBus(@Valid @RequestBody BusRequestDto busRequestDto) {
        BusResponseDto createdBus = busService.createBus(busRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bus created successfully", createdBus));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BusResponseDto>> updateBus(
            @PathVariable Long id,
            @Valid @RequestBody BusRequestDto busRequestDto) {
        BusResponseDto updatedBus = busService.updateBus(id, busRequestDto);
        return ResponseEntity.ok(ApiResponse.success("Bus updated successfully", updatedBus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
        return ResponseEntity.ok(ApiResponse.success("Bus deleted successfully", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BusResponseDto>> getBusById(@PathVariable Long id) {
        BusResponseDto bus = busService.getBusById(id);
        return ResponseEntity.ok(ApiResponse.success("Bus retrieved successfully", bus));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BusResponseDto>>> getAllBuses() {
        List<BusResponseDto> buses = busService.getAllBuses();
        return ResponseEntity.ok(ApiResponse.success("Buses retrieved successfully", buses));
    }
}