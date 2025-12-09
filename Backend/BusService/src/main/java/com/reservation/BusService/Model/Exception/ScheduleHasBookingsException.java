package com.reservation.BusService.Model.Exception;

public class ScheduleHasBookingsException extends RuntimeException {
    public ScheduleHasBookingsException(String message) {
        super(message);
    }
}