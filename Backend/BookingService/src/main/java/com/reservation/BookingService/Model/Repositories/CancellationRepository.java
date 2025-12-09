package com.reservation.BookingService.Model.Repositories;



import com.reservation.BookingService.Model.Entities.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CancellationRepository extends JpaRepository<Cancellation, Long> {
    Cancellation findByBookingId(Long bookingId);
}