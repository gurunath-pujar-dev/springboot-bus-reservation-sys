package com.reservation.BusService.Model.DAO.ServiceImpl;


import com.reservation.BusService.Model.DAO.Services.BusService;
import com.reservation.BusService.Model.DTO.BusRequestDto;
import com.reservation.BusService.Model.DTO.BusResponseDto;
import com.reservation.BusService.Model.Entities.Bus;
import com.reservation.BusService.Model.Exception.DuplicateResourceException;
import com.reservation.BusService.Model.Exception.ResourceInUseException;
import com.reservation.BusService.Model.Exception.ResourceNotFoundException;
import com.reservation.BusService.Model.Repositories.BusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BusServiceImpl implements BusService {

    private final BusRepository busRepository;

    @Override
    public BusResponseDto createBus(BusRequestDto busRequestDto) {
        if (busRepository.findByBusNumber(busRequestDto.getBusNumber()).isPresent()) {
            throw new DuplicateResourceException("Bus with number " + busRequestDto.getBusNumber() + " already exists");
        }

        Bus bus = new Bus();
        BeanUtils.copyProperties(busRequestDto, bus);
        Bus savedBus = busRepository.save(bus);

        return convertToResponseDto(savedBus);
    }

    @Override
    public BusResponseDto updateBus(Long id, BusRequestDto busRequestDto) {
        Bus existingBus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + id));

        // Check if bus number is being changed and if it already exists
        if (!existingBus.getBusNumber().equals(busRequestDto.getBusNumber())) {
            if (busRepository.findByBusNumber(busRequestDto.getBusNumber()).isPresent()) {
                throw new DuplicateResourceException("Bus with number " + busRequestDto.getBusNumber() + " already exists");
            }
        }

        BeanUtils.copyProperties(busRequestDto, existingBus, "id");
        Bus updatedBus = busRepository.save(existingBus);

        return convertToResponseDto(updatedBus);
    }

    @Override
    public void deleteBus(Long id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + id));

        if (busRepository.existsByBusIdInSchedules(id)) {
            throw new ResourceInUseException("Scheduled bus cannot be deleted");
        }

        busRepository.delete(bus);
    }

    @Override
    @Transactional(readOnly = true)
    public BusResponseDto getBusById(Long id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + id));

        return convertToResponseDto(bus);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusResponseDto> getAllBuses() {
        return busRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    private BusResponseDto convertToResponseDto(Bus bus) {
        BusResponseDto responseDto = new BusResponseDto();
        BeanUtils.copyProperties(bus, responseDto);
        return responseDto;
    }
}