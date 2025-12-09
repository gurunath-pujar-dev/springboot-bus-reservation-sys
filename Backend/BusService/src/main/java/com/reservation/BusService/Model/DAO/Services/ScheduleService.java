package com.reservation.BusService.Model.DAO.Services;





import com.reservation.BusService.Model.DTO.BusSearchResponseDto;
import com.reservation.BusService.Model.DTO.ScheduleRequestDto;
import com.reservation.BusService.Model.DTO.ScheduleResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleService {
    ScheduleResponseDto createSchedule(ScheduleRequestDto scheduleRequestDto);
    ScheduleResponseDto updateSchedule(Long id, ScheduleRequestDto scheduleRequestDto);
    void deleteSchedule(Long id);
    ScheduleResponseDto getScheduleById(Long id);
    List<ScheduleResponseDto> getAllSchedules();
    List<BusSearchResponseDto> searchBuses(String source, String destination, LocalDate date);
    List<BusSearchResponseDto> searchBusesByRoute(String source, String destination);
    void updateAvailableSeats(Long scheduleId, Integer seatChange);
}