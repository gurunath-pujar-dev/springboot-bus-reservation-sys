package com.reservation.BusService.Model.Repositories;


import com.reservation.BusService.Model.Entities.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.bus " +
            "JOIN FETCH s.route " +
            "WHERE s.route.fromLocation = :source " +
            "AND s.route.toLocation = :destination " +
            "AND s.travelDate = :date " +
            "AND s.availableSeats > 0")
    List<Schedule> findAvailableBuses(@Param("source") String source,
                                      @Param("destination") String destination,
                                      @Param("date") LocalDate date);

    boolean existsByBusIdAndTravelDate(Long busId, LocalDate travelDate);


    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.bus " +
            "JOIN FETCH s.route " +
            "WHERE s.route.fromLocation = :source " +
            "AND s.route.toLocation = :destination " +
            "AND s.availableSeats > 0 " +
            "ORDER BY s.travelDate ASC, s.departure ASC")
    List<Schedule> findAvailableBusesByRoute(@Param("source") String source,
                                             @Param("destination") String destination);


    @Modifying
    @Query(value = "UPDATE schedules SET available_seats = available_seats + :seatChange WHERE id = :scheduleId AND available_seats + :seatChange >= 0", nativeQuery = true)
    int updateAvailableSeats(@Param("scheduleId") Long scheduleId, @Param("seatChange") Integer seatChange);

        @Query(value = "SELECT available_seats FROM schedules WHERE id = :scheduleId", nativeQuery = true)
        Integer findAvailableSeatsById(@Param("scheduleId") Long scheduleId);

        @Query(value = "SELECT COUNT(*) FROM schedules WHERE id = :scheduleId", nativeQuery = true)
        int countById(@Param("scheduleId") Long scheduleId);



}