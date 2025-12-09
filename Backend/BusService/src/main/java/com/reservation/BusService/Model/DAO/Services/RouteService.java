package com.reservation.BusService.Model.DAO.Services;





import com.reservation.BusService.Model.DTO.RouteRequestDto;
import com.reservation.BusService.Model.DTO.RouteResponseDto;

import java.util.List;

public interface RouteService {
    RouteResponseDto createRoute(RouteRequestDto routeRequestDto);
    RouteResponseDto updateRoute(Long id, RouteRequestDto routeRequestDto);
    void deleteRoute(Long id);
    RouteResponseDto getRouteById(Long id);
    List<RouteResponseDto> getAllRoutes();
}