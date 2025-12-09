package com.reservation.BusService.Controller;


import com.reservation.BusService.Model.DAO.Services.RouteService;
import com.reservation.BusService.Model.DTO.ApiResponse;
import com.reservation.BusService.Model.DTO.RouteRequestDto;
import com.reservation.BusService.Model.DTO.RouteResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @PostMapping
    public ResponseEntity<ApiResponse<RouteResponseDto>> createRoute(@Valid @RequestBody RouteRequestDto routeRequestDto) {
        RouteResponseDto createdRoute = routeService.createRoute(routeRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Route created successfully", createdRoute));
    }
    //same name should not be there for fromLoc and ToLoc when giving an update
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteResponseDto>> updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody RouteRequestDto routeRequestDto) {
        RouteResponseDto updatedRoute = routeService.updateRoute(id, routeRequestDto);
        return ResponseEntity.ok(ApiResponse.success("Route updated successfully", updatedRoute));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.ok(ApiResponse.success("Route deleted successfully", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteResponseDto>> getRouteById(@PathVariable Long id) {
        RouteResponseDto route = routeService.getRouteById(id);
        return ResponseEntity.ok(ApiResponse.success("Route retrieved successfully", route));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<RouteResponseDto>>> getAllRoutes() {
        List<RouteResponseDto> routes = routeService.getAllRoutes();
        return ResponseEntity.ok(ApiResponse.success("Routes retrieved successfully", routes));
    }
}