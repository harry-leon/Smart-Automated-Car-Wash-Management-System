package com.autowash.loyalty;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.booking.entity.CustomerBooking;
import com.autowash.booking.entity.PaymentMethod;
import com.autowash.booking.repository.CustomerBookingRepository;
import com.autowash.operation.entity.WashSession;
import com.autowash.operation.repository.WashSessionRepository;
import com.autowash.vehicle.entity.CustomerVehicle;
import com.autowash.vehicle.entity.VehicleType;
import com.autowash.vehicle.repository.CustomerVehicleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoyaltyControllerIntegrationTest {

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

    @Autowired
    private WashSessionRepository washSessionRepository;

    @Test
    void accountHistoryRedeemAndOpenApiUseCustomerScope() throws Exception {
        String phone = "0901888010";
        String accessToken = registerActivateAndLogin(phone);
        AuthUser customer = authUserRepository.findByPhone(phone).orElseThrow();
        WashSession session = createCompletedSession(customer, "LOY_CTL_001", 600000);

        mockMvc.perform(get("/api/v1/loyalty/account")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customerId").value(customer.getId().toString()))
                .andExpect(jsonPath("$.data.currentPoints").value(0))
                .andExpect(jsonPath("$.data.tier").value("MEMBER"));

        mockMvc.perform(post("/api/v1/loyalty/earn")
                        .with(user("admin").roles("ADMIN"))
                        .contentType("application/json")
                        .content("""
                                {
                                  "customerId": "%s",
                                  "sessionId": "%s"
                                }
                                """.formatted(customer.getId(), session.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pointsAwarded").value(60))
                .andExpect(jsonPath("$.data.newBalance").value(60));

        mockMvc.perform(get("/api/v1/loyalty/history")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("type", "EARN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].type").value("EARN"))
                .andExpect(jsonPath("$.pagination.page").value(1));

        mockMvc.perform(post("/api/v1/loyalty/redeem")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                { "pointsToRedeem": 50, "referenceId": "LOY_CTL_001" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pointsRedeemed").value(50))
                .andExpect(jsonPath("$.data.newBalance").value(10));

        mockMvc.perform(post("/api/v1/loyalty/redeem")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                { "pointsToRedeem": 201, "referenceId": "LOY_CTL_001" }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Maximum redemption is 200 points"));

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/loyalty/account']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/loyalty/earn']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/loyalty/redeem']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/loyalty/history']").exists());
    }

    @Test
    void historyRejectsInvalidTypeAndEarnIsAdminOnly() throws Exception {
        String accessToken = registerActivateAndLogin("0901888011");

        mockMvc.perform(get("/api/v1/loyalty/history")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("type", "INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));

        mockMvc.perform(post("/api/v1/loyalty/earn")
                        .with(user("customer").roles("CUSTOMER"))
                        .contentType("application/json")
                        .content("""
                                {
                                  "customerId": "00000000-0000-0000-0000-000000000000",
                                  "sessionId": "00000000-0000-0000-0000-000000000000"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    private WashSession createCompletedSession(AuthUser customer, String bookingId, long finalAmount) {
        CustomerVehicle vehicle = customerVehicleRepository.save(new CustomerVehicle(
                customer,
                "30H-" + customer.getPhone().substring(customer.getPhone().length() - 6),
                VehicleType.CAR,
                "Toyota",
                "Camry",
                2023,
                "Silver",
                true
        ));

        CustomerBooking booking = customerBookingRepository.save(new CustomerBooking(
                bookingId,
                customer,
                vehicle,
                "pkg_001",
                null,
                null,
                LocalDate.of(2026, 6, 10),
                LocalTime.of(14, 0),
                PaymentMethod.E_WALLET,
                finalAmount,
                0,
                0,
                finalAmount,
                30
        ));
        WashSession session = new WashSession(booking, "Loyalty controller test");
        Instant now = Instant.now();
        session.queue(now);
        session.checkIn(now, finalAmount, "VND", 0);
        session.start(now);
        session.complete(now, 0);
        return washSessionRepository.saveAndFlush(session);
    }

    private String registerActivateAndLogin(String phone) throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Nguyen Van A",
                                  "phone": "%s",
                                  "email": "%s@example.com",
                                  "password": "SecurePass1!",
                                  "passwordConfirm": "SecurePass1!"
                                }
                                """.formatted(phone, phone)))
                .andExpect(status().isCreated());

        MvcResult sendOtpResult = mockMvc.perform(post("/api/v1/auth/otp/send")
                        .contentType("application/json")
                        .content("""
                                { "phone": "%s" }
                                """.formatted(phone)))
                .andExpect(status().isOk())
                .andReturn();

        String otp = readJson(sendOtpResult).path("data").path("devOtp").asText();

        MvcResult verifyOtpResult = mockMvc.perform(post("/api/v1/auth/otp/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "phone": "%s",
                                  "otp": "%s"
                                }
                                """.formatted(phone, otp)))
                .andExpect(status().isOk())
                .andReturn();

        return readJson(verifyOtpResult).path("data").path("accessToken").asText();
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
