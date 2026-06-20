package com.autowash.service;

import com.autowash.entity.User;
import com.autowash.entity.enums.UserRole;
import com.autowash.entity.enums.UserStatus;
import com.autowash.repository.UserRepository;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.repository.BookingRepository;
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

    private final UserRepository UserRepository;
    private final BookingRepository bookingRepository;

    public StaffAssignmentService(
            UserRepository UserRepository,
            BookingRepository bookingRepository
    ) {
        this.UserRepository = UserRepository;
        this.bookingRepository = bookingRepository;
    }

    public User pickLeastLoadedActiveStaff() {
        return UserRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.STAFF, UserStatus.ACTIVE)
                .stream()
                .min(Comparator
                        .comparingLong((User staff) ->
                                bookingRepository.countByAssignedStaffAndStatusIn(staff, ACTIVE_ASSIGNMENT_STATUSES))
                        .thenComparing(User::getFullName)
                        .thenComparing(User::getId))
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "No active staff available for booking assignment",
                        "NO_AVAILABLE_STAFF"
                ));
    }

    public User requireActiveStaff(UUID staffId) {
        User staff = UserRepository.findById(staffId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff not found", "RESOURCE_NOT_FOUND"));
        if (staff.getRole() != UserRole.STAFF || staff.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Target staff must be active", "BUSINESS_RULE_VIOLATION");
        }
        return staff;
    }

    public List<User> listActiveStaff() {
        return UserRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.STAFF, UserStatus.ACTIVE);
    }
}

