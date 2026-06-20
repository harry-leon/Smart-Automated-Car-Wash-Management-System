package com.autowash.service;

import com.autowash.entity.*;
import com.autowash.dto.BookingDetailResponse;

import com.autowash.repository.CustomerBookingRepository;
import com.autowash.service.BookingService;
import com.autowash.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBookingService {

    private final CustomerBookingRepository bookingRepository;
    private final BookingService bookingService;

    public AdminBookingService(
            CustomerBookingRepository bookingRepository,
            BookingService bookingService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse getAdminBookingDetail(String bookingId) {
        CustomerBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
        
        return bookingService.toDetailResponse(booking);
    }
}
