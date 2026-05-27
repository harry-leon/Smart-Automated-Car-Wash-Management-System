package com.autowash.operation;

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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OperationsControllerIntegrationTest {

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
    void fullLifecycleSyncsBookingStatusAndReturnsFeeAndPoints() throws Exception {
        CustomerBooking booking = createConfirmedBooking("OPS_BK_001", "0901777001", 270000);

        String sessionId = createSession(booking.getId());
        assertBookingStatus(booking.getId(), "CONFIRMED");

        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/queue", sessionId)
                        .with(user("staff").roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sessionId").value(sessionId))
                .andExpect(jsonPath("$.data.status").value("QUEUED"))
                .andExpect(jsonPath("$.data.queuedAt").exists());
        assertBookingStatus(booking.getId(), "CONFIRMED");

        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/check-in", sessionId)
                        .with(user("staff").roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CHECKED_IN"))
                .andExpect(jsonPath("$.data.fee.amount").value(270000))
                .andExpect(jsonPath("$.data.fee.currency").value("VND"))
                .andExpect(jsonPath("$.data.projectedLoyaltyPoints").value(27));
        assertBookingStatus(booking.getId(), "CHECKED_IN");
        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/start", sessionId)
                        .with(user("staff").roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.startedAt").exists());
        assertBookingStatus(booking.getId(), "IN_PROGRESS");

        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/complete", sessionId)
                        .with(user("staff").roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.completedAt").exists())
                .andExpect(jsonPath("$.data.awardedLoyaltyPoints").value(27));

        assertBookingStatus(booking.getId(), "COMPLETED");
    }

    @Test
    void invalidTransitionReturnsConflict() throws Exception {
        CustomerBooking booking = createConfirmedBooking("OPS_BK_002", "0901777002", 150000);
        String sessionId = createSession(booking.getId());

        mockMvc.perform(post("/api/v1/operations/sessions/{sessionId}/check-in", sessionId)
                        .with(user("staff").roles("STAFF")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Invalid transition: PENDING \u2192 CHECKED_IN"))
                .andExpect(jsonPath("$.errorCode").value("INVALID_STATE_TRANSITION"));
    }

    @Test
    void openApiDocumentsOperationsSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/operations/sessions']").exists())
                .andExpect(jsonPath("$.components.schemas.CreateWashSessionRequest.properties.bookingId.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.CheckInWashSessionResponse.properties.projectedLoyaltyPoints.type").value("integer"))
                .andExpect(jsonPath("$.components.schemas.CompleteWashSessionResponse.properties.awardedLoyaltyPoints.type").value("integer"));
    }

    private String createSession(String bookingId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/operations/sessions")
                        .with(user("staff").roles("STAFF"))
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "notes": "Arrived at bay 1"
                                }
                                """.formatted(bookingId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.bookingId").value(bookingId))
                .andReturn();
        return readJson(result).path("data").path("sessionId").asText();
    }

    private CustomerBooking createConfirmedBooking(String bookingId, String phone, long finalAmount) {
        AuthUser user = new AuthUser("Nguyen Van A", phone, phone + "@example.com", "hash");
        user.activate();
        authUserRepository.save(user);

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

        return customerBookingRepository.saveAndFlush(new CustomerBooking(
                bookingId,
                user,
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
    }

    private void assertBookingStatus(String bookingId, String status) {
        customerBookingRepository.flush();
        CustomerBooking booking = customerBookingRepository.findById(bookingId).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(booking.getStatus().name()).isEqualTo(status);
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
