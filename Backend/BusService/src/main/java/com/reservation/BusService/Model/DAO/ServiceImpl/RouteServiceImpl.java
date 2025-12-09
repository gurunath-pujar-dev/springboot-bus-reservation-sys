package com.reservation.BusService.Model.DAO.ServiceImpl;

import com.reservation.BusService.Model.DAO.Services.RouteService;
import com.reservation.BusService.Model.DTO.RouteRequestDto;
import com.reservation.BusService.Model.DTO.RouteResponseDto;
import com.reservation.BusService.Model.Entities.Route;
import com.reservation.BusService.Model.Exception.DuplicateResourceException;
import com.reservation.BusService.Model.Exception.ResourceInUseException;
import com.reservation.BusService.Model.Exception.ResourceNotFoundException;
import com.reservation.BusService.Model.Repositories.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RouteServiceImpl implements RouteService {

    private final RouteRepository routeRepository;

    @Override
    public RouteResponseDto createRoute(RouteRequestDto routeRequestDto) {
        if (routeRepository.findByFromLocationAndToLocation(
                routeRequestDto.getFromLocation(),
                routeRequestDto.getToLocation()).isPresent()) {
            throw new DuplicateResourceException("Route from " + routeRequestDto.getFromLocation() +
                    " to " + routeRequestDto.getToLocation() + " already exists");
        }

        if((routeRequestDto.getFromLocation().toLowerCase()).equals(routeRequestDto.getToLocation().toLowerCase())){
            throw new DuplicateResourceException("Source and Destination cannot be same");
        }
        Route route = new Route();
        BeanUtils.copyProperties(routeRequestDto, route);
        Route savedRoute = routeRepository.save(route);

        return convertToResponseDto(savedRoute);
    }

    @Override
    public RouteResponseDto updateRoute(Long id, RouteRequestDto routeRequestDto) {
        Route existingRoute = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        // Check uniqueness of from and to location before update
        if (!existingRoute.getFromLocation().equals(routeRequestDto.getFromLocation()) ||
                !existingRoute.getToLocation().equals(routeRequestDto.getToLocation())) {
            if (routeRepository.findByFromLocationAndToLocation(
                    routeRequestDto.getFromLocation(),
                    routeRequestDto.getToLocation()).isPresent()) {
                throw new DuplicateResourceException("Route from " + routeRequestDto.getFromLocation() +
                        " to " + routeRequestDto.getToLocation() + " already exists");
            }
        }
        if((routeRequestDto.getFromLocation().toLowerCase()).equals(routeRequestDto.getToLocation().toLowerCase())){
            throw new DuplicateResourceException("Source and Destination cannot be same");
        }

        BeanUtils.copyProperties(routeRequestDto, existingRoute, "id");
        Route updatedRoute = routeRepository.save(existingRoute);

        return convertToResponseDto(updatedRoute);
    }

    @Override
    public void deleteRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        if (routeRepository.existsByRouteIdInSchedules(id)) {
            throw new ResourceInUseException("Route added to schedule cannot be deleted");
        }

        routeRepository.delete(route);
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponseDto getRouteById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        return convertToResponseDto(route);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RouteResponseDto> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    private RouteResponseDto convertToResponseDto(Route route) {
        RouteResponseDto responseDto = new RouteResponseDto();
        BeanUtils.copyProperties(route, responseDto);
        return responseDto;
    }
}