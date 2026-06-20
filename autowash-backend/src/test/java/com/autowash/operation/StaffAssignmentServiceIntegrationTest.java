package com.autowash.operation;

import static org.assertj.core.api.Assertions.assertThat;

import com.autowash.entity.AuthUser;
import com.autowash.entity.enums.UserRole;
import com.autowash.repository.AuthUserRepository;
import com.autowash.entity.CustomerBooking;
import com.autowash.entity.enums.PaymentMethod;
import com.autowash.repository.CustomerBookingRepository;
import com.autowash.service.StaffAssignmentService;
import com.autowash.entity.CustomerVehicle;
import com.autowash.entity.enums.VehicleType;
import com.autowash.repository.CustomerVehicleRepository;
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
                LocalDate.now().plusDays(1),
                LocalTime.of(14, 0),
                PaymentMethod.E_WALLET,
                150000,
                0,
                0,
                150000,
                30
        );
        booking.confirmByOtp();
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
