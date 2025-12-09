package com.reservation.BusService.Model.Repositories;



import com.reservation.BusService.Model.Entities.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    Optional<Route> findByFromLocationAndToLocation(String fromLocation, String toLocation);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Schedule s WHERE s.route.id = :routeId")
    boolean existsByRouteIdInSchedules(@Param("routeId") Long routeId);
}