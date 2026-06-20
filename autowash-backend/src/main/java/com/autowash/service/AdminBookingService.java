package com.autowash.service;

import com.autowash.dto.BookingDetailResponse;
import com.autowash.entity.Booking;
import com.autowash.repository.BookingRepository;
import com.autowash.service.BookingService;
import com.autowash.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    public AdminBookingService(
            BookingRepository bookingRepository,
            BookingService bookingService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse getAdminBookingDetail(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found", "RESOURCE_NOT_FOUND"));
        
        return bookingService.toDetailResponse(booking);
    }
}
