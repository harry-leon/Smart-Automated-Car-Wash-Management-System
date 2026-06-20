package com.autowash.loyalty;

import com.autowash.entity.*;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


import com.autowash.entity.enums.LoyaltyTier;
import com.autowash.entity.enums.UserRole;
import com.autowash.repository.AuthUserRepository;

import com.autowash.entity.enums.PaymentMethod;
import com.autowash.repository.CustomerBookingRepository;
import com.autowash.shared.security.AuthUserPrincipal;

import com.autowash.entity.enums.VehicleType;
import com.autowash.repository.CustomerVehicleRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerLoyaltyAndPromotionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private CustomerVehicleRepository customerVehicleRepository;

    @Autowired
    private CustomerBookingRepository customerBookingRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void loyaltyAccountAndTransactionsReflectCompletedWashPoints() throws Exception {
        String phone = "0901777101";
        CustomerBooking booking = createConfirmedBooking("LOYALTY_BK_001", phone, 270000);
        String sessionId = createCompletedSession(booking.getId());
        AuthUser customer = authUserRepository.findByPhone(phone).orElseThrow();

        mockMvc.perform(get("/api/v1/loyalty/account")
                        .with(authenticatedCustomer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tier").value("MEMBER"))
                .andExpect(jsonPath("$.data.currentPoints").value(27))
                .andExpect(jsonPath("$.data.completedWashCount").value(1))
                .andExpect(jsonPath("$.data.totalEarnedPoints").value(27));

        mockMvc.perform(get("/api/v1/loyalty/transactions")
                        .with(authenticatedCustomer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].type").value("EARN"))
                .andExpect(jsonPath("$.data[0].points").value(27))
                .andExpect(jsonPath("$.data[0].bookingId").value("LOYALTY_BK_001"))
                .andExpect(jsonPath("$.data[0].sessionId").value(sessionId));
    }

    @Test
    void washHistoryReturnsCompletedSessionsWithAwardedPoints() throws Exception {
        String phone = "0901777102";
        CustomerBooking booking = createConfirmedBooking("LOYALTY_BK_002", phone, 150000);
        String sessionId = createCompletedSession(booking.getId());
        String vehiclePlate = "30H-" + phone.substring(phone.length() - 6);
        AuthUser customer = authUserRepository.findByPhone(phone).orElseThrow();

        mockMvc.perform(get("/api/v1/customers/wash-history")
                        .with(authenticatedCustomer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].sessionId").value(sessionId))
                .andExpect(jsonPath("$.data[0].bookingId").value("LOYALTY_BK_002"))
                .andExpect(jsonPath("$.data[0].vehiclePlate").value(vehiclePlate))
                .andExpect(jsonPath("$.data[0].awardedPoints").value(15))
                .andExpect(jsonPath("$.data[0].status").value("COMPLETED"));
    }

    @Test
    void redeemUpdatesAccountBalanceAndTransactionHistory() throws Exception {
        String phone = "0901777105";
        CustomerBooking booking = createConfirmedBooking("LOYALTY_BK_003", phone, 600000);
        AuthUser customer = authUserRepository.findByPhone(phone).orElseThrow();
        createCompletedSession(booking.getId());

        mockMvc.perform(post("/api/v1/loyalty/redeem")
                        .with(authenticatedCustomer(customer))
                        .contentType("application/json")
                        .content("""
                                {
                                  "pointsToRedeem": 50,
                                  "referenceId": "LOYALTY_BK_003"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pointsRedeemed").value(50))
                .andExpect(jsonPath("$.data.newBalance").value(10))
                .andExpect(jsonPath("$.data.voucherCode").isString())
                .andExpect(jsonPath("$.data.voucherValue").value(50000))
                .andExpect(jsonPath("$.data.expiresAt").exists())
                .andExpect(jsonPath("$.data.status").value("SUCCESS"));

        mockMvc.perform(get("/api/v1/loyalty/account")
                        .with(authenticatedCustomer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentPoints").value(10))
                .andExpect(jsonPath("$.data.totalEarnedPoints").value(60));

        mockMvc.perform(get("/api/v1/loyalty/transactions")
                        .with(authenticatedCustomer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].type").value("REDEEM"))
                .andExpect(jsonPath("$.data[0].points").value(-50))
                .andExpect(jsonPath("$.data[0].description").value(org.hamcrest.Matchers.startsWith("Voucher redemption:")))
                .andExpect(jsonPath("$.data[1].type").value("EARN"))
                .andExpect(jsonPath("$.data[1].points").value(60));
    }

    @Test
    void activePromotionsFilterByCustomerTierAndNewCustomerAudience() throws Exception {
        AuthUser member = createActiveCustomer("0901777103");
        mockMvc.perform(get("/api/v1/promotions/active")
                        .with(authenticatedCustomer(member)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[*].promotionCode", hasItem("ALL10")))
                .andExpect(jsonPath("$.data[*].promotionCode", hasItem("WELCOME20")));

        AuthUser gold = createActiveCustomer("0901777104");
        jdbcTemplate.update("update auth_users set tier = ? where id = ?", LoyaltyTier.GOLD.name(), gold.getId());
        jdbcTemplate.update("update auth_users set is_new_customer = ? where id = ?", false, gold.getId());

        mockMvc.perform(get("/api/v1/promotions/active")
                        .with(authenticatedCustomer(gold)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[*].promotionCode", hasItem("ALL10")))
                .andExpect(jsonPath("$.data[*].promotionCode", hasItem("GOLD15")));
    }

    @Test
    void openApiDocumentsCustomerLoyaltyHistoryAndPromotionSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/loyalty/account']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/loyalty/transactions']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/customers/wash-history']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/promotions/active']").exists())
                .andExpect(jsonPath("$.components.schemas.LoyaltyAccountResponse.properties.currentPoints.type").value("integer"))
                .andExpect(jsonPath("$.components.schemas.LoyaltyAccountResponse.properties.totalEarnedPoints.type").value("integer"))
                .andExpect(jsonPath("$.components.schemas.RedeemPointsResponse.properties.voucherCode.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.LoyaltyTransactionResponse.properties.points.type").value("integer"))
                .andExpect(jsonPath("$.components.schemas.WashHistoryItemResponse.properties.awardedPoints.type").value("integer"))
                .andExpect(jsonPath("$.components.schemas.CustomerPromotionResponse.properties.promotionCode.type").value("string"));
    }

    private String createCompletedSession(String bookingId) throws Exception {
        AuthUser staff = createActiveStaff("Loyalty Staff");
        CustomerBooking booking = customerBookingRepository.findById(bookingId).orElseThrow();
        booking.assignStaff(staff);
        customerBookingRepository.saveAndFlush(booking);

        String sessionId = mockMvc.perform(post("/api/v1/operations/sessions")
                        .with(authenticatedUser(staff))
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "notes": "Ready for wash bay"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString()
                .replaceAll(".*\"sessionId\":\"([^\"]+)\".*", "$1");

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

    private AuthUser createActiveStaff(String fullName) {
        AuthUser staff = new AuthUser(fullName, uniquePhone("0915"), "loyalty-staff-" + java.util.UUID.randomUUID() + "@example.com", "hash");
        staff.activate();
        ReflectionTestUtils.setField(staff, "role", UserRole.STAFF);
        return authUserRepository.saveAndFlush(staff);
    }

    private RequestPostProcessor authenticatedUser(AuthUser user) {
        AuthUserPrincipal principal = new AuthUserPrincipal(user);
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities());
        return authentication(token);
    }

    private String uniquePhone(String prefix) {
        String digits = java.util.UUID.randomUUID().toString().replaceAll("\\D", "");
        while (digits.length() < 6) {
            digits += "0";
        }
        return prefix + digits.substring(0, 6);
    }

    private CustomerBooking createConfirmedBooking(String bookingId, String phone, long finalAmount) {
        AuthUser user = createActiveCustomer(phone);

        CustomerVehicle vehicle = customerVehicleRepository.save(new CustomerVehicle(
                user,
                "30H-" + phone.substring(phone.length() - 6),
                VehicleType.CAR,
                "Toyota",
                "Camry",
                2023,
                "Silver",
                true
        ));

        CustomerBooking booking = new CustomerBooking(
                bookingId,
                user,
                vehicle,
                "pkg_001",
                null,
                null,
                LocalDate.now().plusDays(1),
                LocalTime.of(14, 0),
                PaymentMethod.E_WALLET,
                finalAmount,
                0,
                0,
                finalAmount,
                30
        );
        booking.confirmByOtp();
        return customerBookingRepository.saveAndFlush(booking);
    }

    private AuthUser createActiveCustomer(String phone) {
        AuthUser user = new AuthUser("Nguyen Van A", phone, phone + "@example.com", "hash");
        user.activate();
        return authUserRepository.saveAndFlush(user);
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor authenticatedCustomer(AuthUser user) {
        AuthUserPrincipal principal = new AuthUserPrincipal(user);
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities());
        return authentication(token);
    }
}
