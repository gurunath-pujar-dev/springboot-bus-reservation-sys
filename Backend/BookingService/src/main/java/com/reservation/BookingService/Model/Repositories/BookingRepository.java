package com.reservation.BookingService.Model.Repositories;


import com.reservation.BookingService.Model.Entities.Booking;
import com.reservation.BookingService.Model.Entities.Enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.id IN :bookingIds")
    List<Booking> findByIdIn(@Param("bookingIds") List<Long> bookingIds);

    List<Booking> findByScheduleId(Long scheduleId);

    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND b.status = :status")
    List<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") BookingStatus status);

    boolean existsByScheduleIdAndStatus(Long scheduleId, BookingStatus status);

}
