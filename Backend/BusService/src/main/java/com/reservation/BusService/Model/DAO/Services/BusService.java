package com.reservation.BusService.Model.DAO.Services;



import com.reservation.BusService.Model.DTO.BusRequestDto;
import com.reservation.BusService.Model.DTO.BusResponseDto;

import java.util.List;

public interface BusService {
    BusResponseDto createBus(BusRequestDto busRequestDto);
    BusResponseDto updateBus(Long id, BusRequestDto busRequestDto);
    void deleteBus(Long id);
    BusResponseDto getBusById(Long id);
    List<BusResponseDto> getAllBuses();
}