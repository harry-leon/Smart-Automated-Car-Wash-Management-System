package com.autowash.service;

import com.autowash.entity.AuthUser;
import com.autowash.entity.enums.UserRole;
import com.autowash.entity.enums.UserStatus;
import com.autowash.repository.AuthUserRepository;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.repository.CustomerBookingRepository;
import com.autowash.shared.exception.ApiException;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class StaffAssignmentService {

    private static final Set<BookingStatus> ACTIVE_ASSIGNMENT_STATUSES = Set.of(
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.IN_PROGRESS
    );

    private final AuthUserRepository authUserRepository;
    private final CustomerBookingRepository bookingRepository;

    public StaffAssignmentService(
            AuthUserRepository authUserRepository,
            CustomerBookingRepository bookingRepository
    ) {
        this.authUserRepository = authUserRepository;
        this.bookingRepository = bookingRepository;
    }

    public AuthUser pickLeastLoadedActiveStaff() {
        return authUserRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.STAFF, UserStatus.ACTIVE)
                .stream()
                .min(Comparator
                        .comparingLong((AuthUser staff) ->
                                bookingRepository.countByAssignedStaffAndStatusIn(staff, ACTIVE_ASSIGNMENT_STATUSES))
                        .thenComparing(AuthUser::getFullName)
                        .thenComparing(AuthUser::getId))
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "No active staff available for booking assignment",
                        "NO_AVAILABLE_STAFF"
                ));
    }

    public AuthUser requireActiveStaff(UUID staffId) {
        AuthUser staff = authUserRepository.findById(staffId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff not found", "RESOURCE_NOT_FOUND"));
        if (staff.getRole() != UserRole.STAFF || staff.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Target staff must be active", "BUSINESS_RULE_VIOLATION");
        }
        return staff;
    }

    public List<AuthUser> listActiveStaff() {
        return authUserRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.STAFF, UserStatus.ACTIVE);
    }
}

