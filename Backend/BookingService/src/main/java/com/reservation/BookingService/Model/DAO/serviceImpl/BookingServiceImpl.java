package com.reservation.BookingService.Model.DAO.serviceImpl;
import com.reservation.BookingService.Client.BusServiceClient;
import com.reservation.BookingService.Model.DAO.service.BookingService;
import com.reservation.BookingService.Model.DTO.*;
import com.reservation.BookingService.Model.Entities.Cancellation;
import com.reservation.BookingService.Model.Entities.Passenger;
import com.reservation.BookingService.Model.Entities.Booking;
import com.reservation.BookingService.Model.Entities.Enums.BookingStatus;
import com.reservation.BookingService.Model.Exception.*;
import com.reservation.BookingService.Model.Repositories.BookingRepository;
import com.reservation.BookingService.Model.Repositories.CancellationRepository;
import com.reservation.BookingService.Model.Repositories.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private CancellationRepository cancellationRepository;

    @Autowired
    private BusServiceClient busServiceClient;

    @Override
    public BookingResponseDto createBooking(BookingRequestDto bookingRequest, Long userId) {
        // Get schedule details from bus service
        ResponseEntity<ScheduleResponseDto> scheduleResponse = busServiceClient.getScheduleById(bookingRequest.getScheduleId());
        if (!scheduleResponse.getStatusCode().is2xxSuccessful() || scheduleResponse.getBody() == null) {
            throw new ScheduleNotFoundException("Schedule not found with ID: " + bookingRequest.getScheduleId());
        }

        ScheduleResponseDto schedule = scheduleResponse.getBody();

        // Check if enough seats are available
        if (schedule.getAvailableSeats() < bookingRequest.getNoOfSeats()) {
            throw new InsufficientSeatsException("Only " + schedule.getAvailableSeats() + " seats available");
        }

        // Validate passenger count matches requested seats
        if (bookingRequest.getPassengers().size() != bookingRequest.getNoOfSeats()) {
            throw new IllegalArgumentException("Number of passengers must match number of seats requested");
        }

        // Calculate total amount
        BigDecimal totalAmount = schedule.getRoute().getPrice()
                .multiply(BigDecimal.valueOf(bookingRequest.getNoOfSeats()));

        busServiceClient.updateAvailableSeats(bookingRequest.getScheduleId(), -bookingRequest.getNoOfSeats());
        // Create booking
        Booking booking = new Booking(userId, bookingRequest.getScheduleId(), totalAmount, bookingRequest.getNoOfSeats());
        booking = bookingRepository.save(booking);


        // Generate seat numbers and create passengers
        List<Integer> availableSeats = generateAvailableSeats(schedule, bookingRequest.getNoOfSeats());
        List<Passenger> passengers = new ArrayList<>();

        for (int i = 0; i < bookingRequest.getPassengers().size(); i++) {
            PassengerRequestDto passengerDto = bookingRequest.getPassengers().get(i);
            Passenger passenger = new Passenger(
                    passengerDto.getPassengerName(),
                    passengerDto.getAge(),
                    passengerDto.getGender(),
                    availableSeats.get(i)
            );
            passenger.setBooking(booking);
            passengers.add(passenger);
        }

        passengers = passengerRepository.saveAll(passengers);
        booking.setPassengers(passengers);

        // Update available seats in bus service

        return mapToBookingResponseDto(booking, schedule);
    }

//
    @Override
    public CancellationResponseDto cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));

        // Check if user owns the booking
        if (!booking.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to cancel this booking");
        }

        // Check if booking is already cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new CancellationNotAllowedException("Booking is already cancelled");
        }

        // Get schedule details for cancellation policy
        ResponseEntity<ScheduleResponseDto> scheduleResponse = busServiceClient.getScheduleById(booking.getScheduleId());
        if (!scheduleResponse.getStatusCode().is2xxSuccessful() || scheduleResponse.getBody() == null) {
            throw new ScheduleNotFoundException("Schedule not found");
        }

        ScheduleResponseDto schedule = scheduleResponse.getBody();

        // Calculate refund amount based on cancellation time
        BigDecimal refundAmount = calculateRefundAmount(booking, schedule);

        // Update booking status
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Create cancellation record
        Cancellation cancellation = new Cancellation(booking, userId, refundAmount);
        cancellation = cancellationRepository.save(cancellation);

        // Restore seats in bus service
        busServiceClient.updateAvailableSeats(booking.getScheduleId(), booking.getNoOfSeats());
        return mapToCancellationResponseDto(cancellation);
    }


@Override
public List<BookingResponseDto> getAllBookings() {
    List<Booking> bookings = bookingRepository.findAll();

    return bookings.stream()
            .sorted(Comparator.comparing(Booking::getBookingTime).reversed()) // sort latest first
            .map(booking -> {
                ResponseEntity<ScheduleResponseDto> scheduleResponse =
                        busServiceClient.getScheduleById(booking.getScheduleId());
                ScheduleResponseDto schedule = scheduleResponse.getBody();
                return mapToBookingResponseDto(booking, schedule);
            })
            .collect(Collectors.toList());
}


    @Override
    public List<BookingResponseDto> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);

        return bookings.stream()
                .sorted(Comparator.comparing(Booking::getBookingTime).reversed())
                .map(booking -> {
                    ResponseEntity<ScheduleResponseDto> scheduleResponse =
                            busServiceClient.getScheduleById(booking.getScheduleId());
                    ScheduleResponseDto schedule = scheduleResponse.getBody();
                    return mapToBookingResponseDto(booking, schedule);
                })
                .collect(Collectors.toList());
    }


    public boolean hasActiveBookingsByScheduleId(Long scheduleId) {
        // Check if there are any confirmed bookings for the given schedule
        return bookingRepository.existsByScheduleIdAndStatus(scheduleId, BookingStatus.CONFIRMED);
    }

    @Override
    public List<PassengerResponseDto> getPassengersByScheduleId(Long scheduleId) {
        // Validate input - throw exception directly
//        validateScheduleId(scheduleId);

        // Fetch passengers - let DataAccessException bubble up to global handler
        List<Passenger> passengers = passengerRepository.findPassengersByScheduleId(scheduleId);

        // Convert to DTO - any conversion error will bubble up
        return passengers.stream()
                .map(this::mapToPassengerResponseDto)
                .collect(Collectors.toList());
    }



    private PassengerResponseDto convertToDto(Passenger passenger) {
        // Direct conversion - any NPE or conversion error will bubble up
        return new PassengerResponseDto(
                passenger.getPassengerId(),
                passenger.getPassengerName(),
                passenger.getAge(),
                passenger.getGender(),
                passenger.getSeatNumber()
        );
    }



    @Override
    public List<BookingResponseDto> getUpcomingJourneys(Long userId) {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        List<Booking> confirmedBookings = bookingRepository
                .findByUserIdAndStatus(userId, BookingStatus.CONFIRMED);

        List<BookingResponseDto> upcomingJourneys = new ArrayList<>();

        for (Booking booking : confirmedBookings) {
            ResponseEntity<ScheduleResponseDto> scheduleResponse =
                    busServiceClient.getScheduleById(booking.getScheduleId());
            ScheduleResponseDto schedule = scheduleResponse.getBody();

            if (schedule != null && isUpcomingJourney(schedule, currentDate, currentTime)) {
                BookingResponseDto bookingDto = mapToBookingResponseDto(booking, schedule);
                upcomingJourneys.add(bookingDto);
            }
        }

        // Sort by travel date + departure time in descending order
        upcomingJourneys.sort((b1, b2) -> {
            ScheduleResponseDto s1 = b1.getSchedule();
            ScheduleResponseDto s2 = b2.getSchedule();

            LocalDateTime dt1 = LocalDateTime.of(s1.getTravelDate(), s1.getDeparture());
            LocalDateTime dt2 = LocalDateTime.of(s2.getTravelDate(), s2.getDeparture());

            return dt2.compareTo(dt1); // reverse order
        });

        return upcomingJourneys;
    }

    // Helper method to check if journey is upcoming
    private boolean isUpcomingJourney(ScheduleResponseDto schedule, LocalDate currentDate, LocalTime currentTime) {
        LocalDate travelDate = schedule.getTravelDate();
        LocalTime departureTime = schedule.getDeparture();

        if (travelDate.isAfter(currentDate)) {
            return true; // Future date
        } else if (travelDate.equals(currentDate)) {
            return departureTime.isAfter(currentTime); // Same date, check time
        }
        return false; // Past journey
    }


    private List<Integer> generateAvailableSeats(ScheduleResponseDto schedule, int requiredSeats) {
        // Get occupied seats for this schedule
        List<Integer> occupiedSeats = passengerRepository.findOccupiedSeatsByScheduleId(schedule.getId());

        List<Integer> availableSeats = new ArrayList<>();
        int totalSeats = schedule.getBus().getTotalSeats();

        for (int seatNumber = 1; seatNumber <= totalSeats; seatNumber++) {
            if (!occupiedSeats.contains(seatNumber)) {
                availableSeats.add(seatNumber);
                if (availableSeats.size() == requiredSeats) {
                    break;
                }
            }
        }



        if (availableSeats.size() < requiredSeats) {
            throw new InsufficientSeatsException("Unable to allocate " + requiredSeats + " seats");
        }

        return availableSeats;
    }

    private BigDecimal calculateRefundAmount(Booking booking, ScheduleResponseDto schedule) {
        LocalDateTime travelDateTime = LocalDateTime.of(schedule.getTravelDate(), schedule.getDeparture());
        LocalDateTime now = LocalDateTime.now();

        long hoursUntilTravel = ChronoUnit.HOURS.between(now, travelDateTime);

        BigDecimal refundPercentage;
        if (hoursUntilTravel >= 24) {
            refundPercentage = BigDecimal.valueOf(0.90); // 90% refund
        } else if (hoursUntilTravel >= 12) {
            refundPercentage = BigDecimal.valueOf(0.75); // 75% refund
        } else if (hoursUntilTravel >= 6) {
            refundPercentage = BigDecimal.valueOf(0.50); // 50% refund
        } else if (hoursUntilTravel >= 2) {
            refundPercentage = BigDecimal.valueOf(0.25); // 25% refund
        } else {
            throw new CancellationNotAllowedException("Cancellation not allowed within 2 hours of departure");
        }

        return booking.getTotalAmount().multiply(refundPercentage);
    }

    private BookingResponseDto mapToBookingResponseDto(Booking booking, ScheduleResponseDto schedule) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUserId());
        dto.setScheduleId(booking.getScheduleId());
        dto.setBookingTime(booking.getBookingTime());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setNoOfSeats(booking.getNoOfSeats());
        dto.setStatus(booking.getStatus());
        dto.setSchedule(schedule);

        if (booking.getPassengers() != null) {
            dto.setPassengers(booking.getPassengers().stream()
                    .map(this::mapToPassengerResponseDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private PassengerResponseDto mapToPassengerResponseDto(Passenger passenger) {
//        PassengerResponseDto dto = new PassengerResponseDto(1L, "Alice", 25, "F");
        PassengerResponseDto dto = new PassengerResponseDto();
        dto.setPassengerId(passenger.getPassengerId());
        dto.setPassengerName(passenger.getPassengerName());
        dto.setAge(passenger.getAge());
        dto.setGender(passenger.getGender());
        dto.setSeatNumber(passenger.getSeatNumber());
        return dto;
    }

    private CancellationResponseDto mapToCancellationResponseDto(Cancellation cancellation) {
        CancellationResponseDto dto = new CancellationResponseDto();
        BigDecimal refundPerc = cancellation.getRefundAmount()
                .divide(cancellation.getBooking().getTotalAmount(), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        dto.setId(cancellation.getId());
        dto.setBookingId(cancellation.getBooking().getId());
        dto.setUserId(cancellation.getUserId());
        dto.setCancelDate(cancellation.getCancelDate());
        dto.setRefundAmount(cancellation.getRefundAmount());
        dto.setMessage("Booking cancelled successfully . Amount will be refunded within 2 business days.");
        dto.setRefundPercent(refundPerc);
        return dto;
    }
}