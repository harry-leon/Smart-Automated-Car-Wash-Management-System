package com.autowash.service.impl;

import com.autowash.entity.User;
import com.autowash.entity.enums.BookingStatus;
import com.autowash.entity.enums.UserRole;
import com.autowash.entity.enums.UserStatus;
import com.autowash.entity.enums.WashSessionStatus;
import com.autowash.repository.BookingRepository;
import com.autowash.repository.UserRepository;
import com.autowash.repository.WashSessionRepository;
import com.autowash.shared.exception.ApiException;
import com.autowash.service.StaffAssignmentService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class StaffAssignmentServiceImpl implements StaffAssignmentService {

    private static final ZoneId ASSIGNMENT_ZONE = ZoneId.systemDefault();

    private static final Set<BookingStatus> ACTIVE_ASSIGNMENT_STATUSES = Set.of(
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.IN_PROGRESS
    );

    private static final Set<WashSessionStatus> BUSY_SESSION_STATUSES = Set.of(
            WashSessionStatus.PENDING,
            WashSessionStatus.QUEUED,
            WashSessionStatus.CHECKED_IN,
            WashSessionStatus.IN_PROGRESS
    );

    private final UserRepository UserRepository;
    private final BookingRepository bookingRepository;
    private final WashSessionRepository washSessionRepository;

    public StaffAssignmentServiceImpl(
            UserRepository UserRepository,
            BookingRepository bookingRepository,
            WashSessionRepository washSessionRepository
    ) {
        this.UserRepository = UserRepository;
        this.bookingRepository = bookingRepository;
        this.washSessionRepository = washSessionRepository;
    }

    @Override
    public Optional<User> tryPickStaffForBookingAssignment() {
        Instant dayStart = startOfToday();
        Instant dayEnd = startOfTomorrow();
        return UserRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.STAFF, UserStatus.ACTIVE)
                .stream()
                .filter(staff -> !washSessionRepository.existsByAssignedStaffAndStatusIn(staff, BUSY_SESSION_STATUSES))
                .min(Comparator
                        .comparingLong((User staff) -> washSessionRepository.countByAssignedStaffAndStatusAndCompletedAtBetween(
                                staff,
                                WashSessionStatus.COMPLETED,
                                dayStart,
                                dayEnd
                        ))
                        .thenComparingLong((User staff) ->
                                bookingRepository.countByAssignedStaffAndStatusIn(staff, ACTIVE_ASSIGNMENT_STATUSES))
                        .thenComparing(User::getFullName)
                        .thenComparing(User::getId));
    }

    @Override
    public User pickLeastLoadedActiveStaff() {
        return tryPickStaffForBookingAssignment()
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "No active staff available for booking assignment",
                        "NO_AVAILABLE_STAFF"
                ));
    }

    @Override
    public User requireActiveStaff(UUID staffId) {
        User staff = UserRepository.findById(staffId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff not found", "RESOURCE_NOT_FOUND"));
        if (staff.getRole() != UserRole.STAFF || staff.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Target staff must be active", "BUSINESS_RULE_VIOLATION");
        }
        return staff;
    }

    @Override
    public List<User> listActiveStaff() {
        return UserRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.STAFF, UserStatus.ACTIVE);
    }

    private static Instant startOfToday() {
        return LocalDate.now(ASSIGNMENT_ZONE).atStartOfDay(ASSIGNMENT_ZONE).toInstant();
    }

    private static Instant startOfTomorrow() {
        return LocalDate.now(ASSIGNMENT_ZONE).plusDays(1).atStartOfDay(ASSIGNMENT_ZONE).toInstant();
    }
}
