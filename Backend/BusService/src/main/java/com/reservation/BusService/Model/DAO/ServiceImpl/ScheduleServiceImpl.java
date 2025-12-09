package com.reservation.BusService.Model.DAO.ServiceImpl;

import com.reservation.BusService.Model.DAO.Services.ScheduleService;
import com.reservation.BusService.Model.DTO.*;
import com.reservation.BusService.Model.Entities.Bus;
import com.reservation.BusService.Model.Entities.Route;
import com.reservation.BusService.Model.Entities.Schedule;
import com.reservation.BusService.Model.Exception.*;
import com.reservation.BusService.Client.BookingServiceClient;
import com.reservation.BusService.Model.Repositories.BusRepository;
import com.reservation.BusService.Model.Repositories.RouteRepository;
import com.reservation.BusService.Model.Repositories.ScheduleRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BookingServiceClient bookingServiceClient;


    @Override
    public ScheduleResponseDto createSchedule(ScheduleRequestDto scheduleRequestDto) {
        // Check if bus is already scheduled for the same day
        boolean exists = scheduleRepository.existsByBusIdAndTravelDate(
                scheduleRequestDto.getBusId(),
                scheduleRequestDto.getTravelDate() // Assuming getter returns a LocalDate
        );

        if (exists) {
            throw new IllegalStateException("Bus is already scheduled for this date: " +
                    scheduleRequestDto.getTravelDate());
        }

        Bus bus = busRepository.findById(scheduleRequestDto.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + scheduleRequestDto.getBusId()));

        Route route = routeRepository.findById(scheduleRequestDto.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + scheduleRequestDto.getRouteId()));

        Schedule schedule = new Schedule();

        BeanUtils.copyProperties(scheduleRequestDto, schedule, "busId", "routeId");
        schedule.setBus(bus);
        schedule.setRoute(route);

        // Set available seats to total seats if not provided
        if (schedule.getAvailableSeats() == null || schedule.getAvailableSeats() == 0) {
            schedule.setAvailableSeats(bus.getTotalSeats());
        }

        Schedule savedSchedule = scheduleRepository.save(schedule);
        return convertToResponseDto(savedSchedule);
    }


    @Override
    public ScheduleResponseDto updateSchedule(Long id, ScheduleRequestDto scheduleRequestDto) {
        boolean exists = scheduleRepository.existsByBusIdAndTravelDate(
                scheduleRequestDto.getBusId(),
                scheduleRequestDto.getTravelDate() // Assuming getter returns a LocalDate
        );

        if (exists) {
            throw new IllegalStateException("Bus is already scheduled for this date: " +
                    scheduleRequestDto.getTravelDate());
        }

        Schedule existingSchedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        Bus bus = busRepository.findById(scheduleRequestDto.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + scheduleRequestDto.getBusId()));

        Route route = routeRepository.findById(scheduleRequestDto.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + scheduleRequestDto.getRouteId()));

        BeanUtils.copyProperties(scheduleRequestDto, existingSchedule, "id", "busId", "routeId");
        existingSchedule.setBus(bus);
        existingSchedule.setRoute(route);

        // Set available seats to total seats if not provided
        if (scheduleRequestDto.getAvailableSeats() == null || scheduleRequestDto.getAvailableSeats() == 0) {
            existingSchedule.setAvailableSeats(bus.getTotalSeats());
        }


        Schedule updatedSchedule = scheduleRepository.save(existingSchedule);
        return convertToResponseDto(updatedSchedule);
    }


@Override
public void deleteSchedule(Long id) {
    Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

    // Check if schedule has active bookings via Feign client
    Boolean hasActiveBookings = checkForActiveBookings(id);

    if (hasActiveBookings) {
        throw new ScheduleHasBookingsException(
                "Cannot delete schedule which has active bookings."
        );
    }

    // If no active bookings, proceed with deletion
    scheduleRepository.delete(schedule);
}

    public Boolean checkForActiveBookings(Long scheduleId) {

        try {
            ResponseEntity<Boolean> response = bookingServiceClient.hasActiveBookings(scheduleId);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

            return false; // Default to false if response is null

        } catch (FeignException.NotFound e) {
            // Booking service returned 404, meaning no bookings found
            return false;

        } catch (FeignException e) {
            // Handle other Feign exceptions (service unavailable, etc.)
            throw new BookingServiceUnavailableException(
                    "Unable to verify bookings for schedule deletion. Booking service is currently unavailable.", e
            );
        }
}

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponseDto getScheduleById(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        return convertToResponseDto(schedule);
    }



    @Override
    @Transactional
    public void updateAvailableSeats(Long scheduleId, Integer seatChange) {
        try {
            // First, check if schedule exists using native query for better performance
            int count = scheduleRepository.countById(scheduleId);
            if (count == 0) {
                throw new ResourceNotFoundException("Schedule not found with id: " + scheduleId);
            }

            // For negative seat changes (booking), validate current available seats
            if (seatChange < 0) {
                Integer currentAvailableSeats = scheduleRepository.findAvailableSeatsById(scheduleId);
                if (currentAvailableSeats == null) {
                    throw new ResourceNotFoundException("Schedule not found with id: " + scheduleId);
                }

                int newAvailableSeats = currentAvailableSeats + seatChange;
                if (newAvailableSeats < 0) {
                    throw new IllegalArgumentException("Insufficient available seats. Current: " +
                            currentAvailableSeats + ", Requested: " + Math.abs(seatChange));
                }
            }

            // Perform atomic update operation with validation in SQL
            int updatedRows = scheduleRepository.updateAvailableSeats(scheduleId, seatChange);

            if (updatedRows == 0) {
                // This could happen if the seats would go negative or schedule doesn't exist
                Integer currentSeats = scheduleRepository.findAvailableSeatsById(scheduleId);
                if (currentSeats == null) {
                    throw new ResourceNotFoundException("Schedule not found with id: " + scheduleId);
                }
                if (currentSeats + seatChange < 0) {
                    throw new IllegalArgumentException("Insufficient available seats. Current: " +
                            currentSeats + ", Requested: " + Math.abs(seatChange));
                }
                throw new InvalidOperationException("Failed to update available seats for schedule id: " + scheduleId);
            }

        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error updating available seats for schedule " + scheduleId +
                    " with change " + seatChange + ": " + e.getMessage());
            throw e;
        }
    }

    

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponseDto> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusSearchResponseDto> searchBuses(String source, String destination, LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findAvailableBuses(source, destination, date);

        return schedules.stream()
                .map(this::convertToSearchResponseDto)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public List<BusSearchResponseDto> searchBusesByRoute(String source, String destination) {
        List<Schedule> schedules = scheduleRepository.findAvailableBusesByRoute(source, destination);

        return schedules.stream()
                .map(this::convertToSearchResponseDto)
                .collect(Collectors.toList());
    }

private ScheduleResponseDto convertToResponseDto(Schedule schedule) {
    ScheduleResponseDto responseDto = new ScheduleResponseDto();
    BeanUtils.copyProperties(schedule, responseDto, "bus", "route");

    // Convert bus
    BusResponseDto busDto = new BusResponseDto();
    BeanUtils.copyProperties(schedule.getBus(), busDto);
    responseDto.setBus(busDto);

    // Get base price
    BigDecimal price = schedule.getRoute().getPrice();

    // Apply 40% increase if AC
    if ("AC".equalsIgnoreCase(schedule.getBus().getBusType())) {
        BigDecimal increase = price.multiply(BigDecimal.valueOf(0.4));
        price = price.add(increase);
    }

    // Convert route
    RouteResponseDto routeDto = new RouteResponseDto();
    BeanUtils.copyProperties(schedule.getRoute(), routeDto);
    routeDto.setPrice(price); // Set the calculated price here

    responseDto.setRoute(routeDto);
    responseDto.setBusId(schedule.getBus().getId());
    responseDto.setRouteId(schedule.getRoute().getId());

    return responseDto;
}


    private BusSearchResponseDto convertToSearchResponseDto(Schedule schedule) {
        BusSearchResponseDto responseDto = new BusSearchResponseDto();
        BigDecimal price = schedule.getRoute().getPrice();
        if (schedule.getBus().getBusType().equals("AC")) {
            BigDecimal increase = price.multiply(BigDecimal.valueOf(0.4));
            price = price.add(increase);
        }

        responseDto.setScheduleId(schedule.getId());
        responseDto.setBusName(schedule.getBus().getBusName());
        responseDto.setBusNumber(schedule.getBus().getBusNumber());
        responseDto.setBusType(schedule.getBus().getBusType());
        responseDto.setTotalSeats(schedule.getBus().getTotalSeats());
        responseDto.setFromLocation(schedule.getRoute().getFromLocation());
        responseDto.setToLocation(schedule.getRoute().getToLocation());
        responseDto.setDistanceKm(schedule.getRoute().getDistanceKm());
        responseDto.setDurationOfTravelMinutes(schedule.getRoute().getDurationOfTravelMinutes());
        responseDto.setPrice(price);
        responseDto.setTravelDate(schedule.getTravelDate());
        responseDto.setDeparture(schedule.getDeparture());
        responseDto.setArrival(schedule.getArrival());
        responseDto.setAvailableSeats(schedule.getAvailableSeats());

        return responseDto;
    }
}