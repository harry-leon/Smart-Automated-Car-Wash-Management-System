package com.autowash.operation;

import static org.assertj.core.api.Assertions.assertThat;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.UserRole;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.booking.entity.PaymentMethod;
import com.autowash.booking.repository.CustomerBookingRepository;
import com.autowash.operation.service.StaffAssignmentService;
import com.autowash.vehicle.entity.CustomerVehicle;
import com.autowash.vehicle.entity.VehicleType;
import com.autowash.vehicle.repository.CustomerVehicleRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

@SpringBootTest
@ActiveProfiles("test")
class StaffAssignmentServiceIntegrationTest {

    @Autowired
    private StaffAssignmentService staffAssignmentService;

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private CustomerVehicleRepository customerVehicleRepository;

    @Autowired
    private CustomerBookingRepository customerBookingRepository;

    @Test
    void picksLeastLoadedActiveStaffForNewBookingAssignment() {
        AuthUser busyStaff = createStaff("Busy Staff", "0913");
        AuthUser availableStaff = createStaff("Available Staff", "0912");
        createAssignedBooking("ASSIGN_BUSY_001", busyStaff, "0901777021");
        createAssignedBooking("ASSIGN_BUSY_002", busyStaff, "0901777022");

        AuthUser selected = staffAssignmentService.pickLeastLoadedActiveStaff();

        assertThat(selected.getId()).isEqualTo(availableStaff.getId());
    }

    private AuthUser createStaff(String fullName, String phonePrefix) {
        AuthUser staff = new AuthUser(fullName, uniquePhone(phonePrefix), fullName.toLowerCase().replace(" ", ".") + "-" + UUID.randomUUID() + "@example.com", "hash");
        staff.activate();
        ReflectionTestUtils.setField(staff, "role", UserRole.STAFF);
        return authUserRepository.saveAndFlush(staff);
    }

    private void createAssignedBooking(String bookingId, AuthUser staff, String customerPhone) {
        AuthUser customer = new AuthUser("Assignment Customer", customerPhone, customerPhone + "@example.com", "hash");
        customer.activate();
        authUserRepository.saveAndFlush(customer);
        CustomerVehicle vehicle = customerVehicleRepository.saveAndFlush(new CustomerVehicle(
                customer,
                "30A-" + customerPhone.substring(customerPhone.length() - 6),
                VehicleType.CAR,
                "Toyota",
                "Camry",
                2023,
                "Silver",
                true
        ));
        CustomerBooking booking = new CustomerBooking(
                bookingId,
                customer,
                vehicle,
                "pkg_001",
                null,
                null,
                LocalDate.of(2026, 6, 10),
                LocalTime.of(14, 0),
                PaymentMethod.E_WALLET,
                150000,
                0,
                0,
                150000,
                30
        );
        booking.assignStaff(staff);
        customerBookingRepository.saveAndFlush(booking);
    }

    private String uniquePhone(String prefix) {
        String digits = UUID.randomUUID().toString().replaceAll("\\D", "");
        while (digits.length() < 6) {
            digits += "0";
        }
        return prefix + digits.substring(0, 6);
    }
}
