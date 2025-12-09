package com.reservation.BusService.Model.Exception;


public class BookingServiceUnavailableException extends RuntimeException {
    public BookingServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
