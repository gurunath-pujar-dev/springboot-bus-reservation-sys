package com.reservation.BusService.Model.Exception;


public class ResourceInUseException extends RuntimeException {
    public ResourceInUseException(String message) {
        super(message);
    }
}