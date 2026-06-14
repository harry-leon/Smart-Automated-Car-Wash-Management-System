package com.autowash.admin;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.UserRole;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.booking.entity.PaymentMethod;
import com.autowash.booking.repository.CustomerBookingRepository;
import com.autowash.shared.security.AuthUserPrincipal;
import com.autowash.vehicle.entity.CustomerVehicle;
import com.autowash.vehicle.entity.VehicleType;
import com.autowash.vehicle.repository.CustomerVehicleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminVoucherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private CustomerVehicleRepository customerVehicleRepository;

    @Autowired
    private CustomerBookingRepository customerBookingRepository;

    @Test
    void adminCanListVoucherCatalog() throws Exception {
        mockMvc.perform(get("/api/v1/admin/vouchers")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()", greaterThan(0)))
                .andExpect(jsonPath("$.data[*].code", hasItem("WELCOME20")));
    }

    @Test
    void adminCanInspectVoucherRedemptionHistory() throws Exception {
        String voucherCode = "ADMINVOUCHER50";
        AuthUser customer = createActiveCustomer("0901999001");
        AuthUser staff = createActiveStaff("Staff Voucher Admin");
        CustomerBooking booking = createConfirmedBooking(customer, staff, "ADMIN_VOUCHER_BK_001", "30H-999001", LocalDate.of(2026, 6, 14), 600000);
        completeSession(booking.getId(), staff);

        MvcResult redeemResult = mockMvc.perform(post("/api/v1/loyalty/redeem")
                        .with(authenticatedCustomer(customer))
                        .contentType("application/json")
                        .content("""
                                {
                                  "pointsToRedeem": 50,
                                  "referenceId": "%s"
                                }
                                """.formatted(voucherCode)))
                .andExpect(status().isOk())
                .andReturn();

        String issuedVoucherCode = readJson(redeemResult).path("data").path("voucherCode").asText();

        mockMvc.perform(get("/api/v1/admin/vouchers/redemptions")
                        .with(user("admin").roles("ADMIN"))
                        .param("searchQuery", issuedVoucherCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()", greaterThan(0)))
                .andExpect(jsonPath("$.data[0].customerId").value(customer.getId().toString()))
                .andExpect(jsonPath("$.data[0].customerName").value("Nguyen Van A"))
                .andExpect(jsonPath("$.data[0].voucherCode").value(issuedVoucherCode))
                .andExpect(jsonPath("$.data[0].pointsRedeemed").value(50))
                .andExpect(jsonPath("$.data[0].balanceAfter").value(10));
    }

    private String completeSession(String bookingId, AuthUser staff) throws Exception {
        String sessionId = createSession(bookingId, staff);
        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/queue", sessionId)
                        .with(authenticatedUser(staff)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/check-in", sessionId)
                        .with(authenticatedUser(staff)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/start", sessionId)
                        .with(authenticatedUser(staff)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/complete", sessionId)
                        .with(authenticatedUser(staff)))
                .andExpect(status().isOk());
        return sessionId;
    }

    private String createSession(String bookingId, AuthUser staff) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/operations/sessions")
                        .with(authenticatedUser(staff))
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "notes": "Admin voucher integration test"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isCreated())
                .andReturn();
        return readJson(result).path("data").path("sessionId").asText();
    }

    private CustomerBooking createConfirmedBooking(
            AuthUser customer,
            AuthUser assignedStaff,
            String bookingId,
            String plate,
            LocalDate bookingDate,
            long finalAmount
    ) {
        CustomerVehicle vehicle = customerVehicleRepository.save(new CustomerVehicle(
                customer,
                plate,
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
                bookingDate,
                LocalTime.of(14, 0),
                PaymentMethod.E_WALLET,
                finalAmount,
                0,
                0,
                finalAmount,
                30
        );
        booking.assignStaff(assignedStaff);
        booking.confirmByOtp();
        return customerBookingRepository.saveAndFlush(booking);
    }

    private AuthUser createActiveCustomer(String phone) {
        AuthUser user = new AuthUser("Nguyen Van A", phone, phone + "@example.com", "hash");
        user.activate();
        return authUserRepository.saveAndFlush(user);
    }

    private AuthUser createActiveStaff(String fullName) {
        AuthUser staff = new AuthUser(fullName, uniquePhone("0918"), "staff-" + plateSafe(fullName) + "@example.com", "hash");
        staff.activate();
        ReflectionTestUtils.setField(staff, "role", UserRole.STAFF);
        return authUserRepository.saveAndFlush(staff);
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor authenticatedUser(AuthUser user) {
        AuthUserPrincipal principal = new AuthUserPrincipal(user);
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities());
        return authentication(token);
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor authenticatedCustomer(AuthUser user) {
        return authenticatedUser(user);
    }

    private String uniquePhone(String prefix) {
        String digits = java.util.UUID.randomUUID().toString().replaceAll("\\D", "");
        while (digits.length() < 6) {
            digits += "0";
        }
        return prefix + digits.substring(0, 6);
    }

    private String plateSafe(String value) {
        return value.toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
