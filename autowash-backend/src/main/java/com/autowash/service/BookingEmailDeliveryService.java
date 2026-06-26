package com.autowash.service;

import com.autowash.entity.Booking;

public interface BookingEmailDeliveryService {

    void sendBookingConfirmation(Booking booking, String email);
}
