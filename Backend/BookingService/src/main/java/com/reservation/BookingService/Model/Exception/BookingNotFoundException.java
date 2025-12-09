package com.reservation.BookingService.Model.Exception;


public class BookingNotFoundException extends RuntimeException {
    public BookingNotFoundException(String message) {
        super(message);
    }
}