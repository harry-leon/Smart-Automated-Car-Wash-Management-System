package com.autowash.booking;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.autowash.auth.entity.AuthUser;
import com.autowash.auth.entity.UserRole;
import com.autowash.auth.repository.AuthUserRepository;
import com.autowash.booking.entity.BookingStatus;
import com.autowash.booking.repository.CustomerBookingRepository;
import com.autowash.loyalty.entity.LoyaltyAccount;
import com.autowash.loyalty.repository.LoyaltyAccountRepository;
import com.autowash.shared.security.AuthUserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerBookingRepository customerBookingRepository;

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private LoyaltyAccountRepository loyaltyAccountRepository;

    @BeforeEach
    void ensureActiveStaffExists() {
        AuthUser staff = new AuthUser("Booking Assignment Staff", uniquePhone("0914"), "booking-assignment-" + java.util.UUID.randomUUID() + "@example.com", "hash");
        staff.activate();
        ReflectionTestUtils.setField(staff, "role", UserRole.STAFF);
        authUserRepository.saveAndFlush(staff);
    }

    @Test
    void getPackagesReturnsPaginatedActivePackages() throws Exception {
        mockMvc.perform(get("/api/v1/packages").param("page", "1").param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].packageId").value("pkg_001"))
                .andExpect(jsonPath("$.pagination.page").value(1))
                .andExpect(jsonPath("$.pagination.limit").value(20));
    }

    @Test
    void getAddOnsReturnsActiveAddOns() throws Exception {
        mockMvc.perform(get("/api/v1/add-ons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].addonId").value("addon_001"));
    }

    @Test
    void getAvailableCombosReturnsActiveCombos() throws Exception {
        mockMvc.perform(get("/api/v1/combos/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].comboId").value("combo_001"));
    }

    @Test
    void validateVoucherReturnsDiscountBreakdown() throws Exception {
        String accessToken = registerActivateAndLogin("0901234701");

        mockMvc.perform(post("/api/v1/bookings/validate-voucher")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "voucherCode": "WELCOME20",
                                  "packageId": "pkg_001",
                                  "amount": 150000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.voucherCode").value("WELCOME20"))
                .andExpect(jsonPath("$.data.isValid").value(true))
                .andExpect(jsonPath("$.data.discountAmount").value(30000))
                .andExpect(jsonPath("$.data.finalAmount").value(120000));
    }

    @Test
    void validateVoucherReturnsContractErrorForExpiredVoucher() throws Exception {
        String accessToken = registerActivateAndLogin("0901234702");

        mockMvc.perform(post("/api/v1/bookings/validate-voucher")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "voucherCode": "OLD10",
                                  "packageId": "pkg_001",
                                  "amount": 150000
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("BUSINESS_RULE_VIOLATION"))
                .andExpect(jsonPath("$.error.code").value("VOUCHER_EXPIRED"));
    }

    @Test
    void createBookingUsesOwnVehicleAndPersistsConfirmedStatus() throws Exception {
        String accessToken = registerActivateAndLogin("0901234703");
        String vehicleId = createVehicle(accessToken, "30H-223456");

        mockMvc.perform(post("/api/v1/customers/bookings")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "vehicleId": "%s",
                                  "packageId": "pkg_001",
                                  "addons": ["addon_001"],
                                  "bookingDate": "2026-06-10",
                                  "bookingTime": "14:00",
                                  "voucherCode": "WELCOME20",
                                  "paymentMethod": "E_WALLET"
                                }
                                """.formatted(vehicleId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.paymentStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.vehicleId").value(vehicleId))
                .andExpect(jsonPath("$.data.finalAmount").value(270000));
    }

    @Test
    void createComboBookingCreatesOwnedComboAndActiveComboLookup() throws Exception {
        String accessToken = registerActivateAndLogin("0901234720");
        String vehicleId = createVehicle(accessToken, "30H-223468");

        mockMvc.perform(post("/api/v1/customers/bookings")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "vehicleId": "%s",
                                  "comboId": "combo_001",
                                  "bookingDate": "2026-06-10",
                                  "bookingTime": "14:00",
                                  "paymentMethod": "E_WALLET"
                                }
                                """.formatted(vehicleId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.comboId").value("combo_001"))
                .andExpect(jsonPath("$.data.customerComboId").isNotEmpty())
                .andExpect(jsonPath("$.data.comboPurchased").value(true));

        mockMvc.perform(get("/api/v1/customers/combos/active")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].comboId").value("combo_001"))
                .andExpect(jsonPath("$.data[0].remainingUsages").value(3));
    }

    @Test
    void activateComboCreatesOwnedCombo() throws Exception {
        String accessToken = registerActivateAndLogin("0901234721");

        mockMvc.perform(post("/api/v1/customers/combos/{comboId}/activate", "combo_001")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "comboId": "combo_001",
                                  "paymentMethod": "E_WALLET"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.comboId").value("combo_001"))
                .andExpect(jsonPath("$.data.paymentMethod").value("E_WALLET"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    void createBookingRejectsVehicleOwnedByAnotherCustomer() throws Exception {
        String ownerToken = registerActivateAndLogin("0901234704");
        String otherToken = registerActivateAndLogin("0901234705");
        String vehicleId = createVehicle(ownerToken, "30H-223457");

        mockMvc.perform(post("/api/v1/customers/bookings")
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "vehicleId": "%s",
                                  "packageId": "pkg_001",
                                  "bookingDate": "2026-06-10",
                                  "bookingTime": "14:00",
                                  "paymentMethod": "E_WALLET"
                                }
                                """.formatted(vehicleId)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void createBookingRejectsInvalidBookingTimeFormatWithValidationError() throws Exception {
        String accessToken = registerActivateAndLogin("0901234710");
        String vehicleId = createVehicle(accessToken, "30H-223460");

        mockMvc.perform(post("/api/v1/customers/bookings")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "vehicleId": "%s",
                                  "packageId": "pkg_001",
                                  "bookingDate": "2026-06-10",
                                  "bookingTime": "2pm",
                                  "paymentMethod": "E_WALLET"
                                }
                                """.formatted(vehicleId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors[0].field").value("bookingTime"));
    }

    @Test
    void getBookingsAndDetailAreOwnerScoped() throws Exception {
        String firstToken = registerActivateAndLogin("0901234706");
        String secondToken = registerActivateAndLogin("0901234707");
        String vehicleId = createVehicle(firstToken, "30H-223458");
        String bookingId = createBooking(firstToken, vehicleId).path("data").path("bookingId").asText();

        mockMvc.perform(get("/api/v1/customers/bookings").header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].bookingId").value(bookingId))
                .andExpect(jsonPath("$.data[0].packageName").value("Basic Wash"));

        mockMvc.perform(get("/api/v1/customers/bookings/{bookingId}", bookingId)
                        .header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingId").value(bookingId))
                .andExpect(jsonPath("$.data.packageName").value("Basic Wash"));

        mockMvc.perform(get("/api/v1/customers/bookings/{bookingId}", bookingId)
                        .header("Authorization", "Bearer " + secondToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void getBookingDetailIncludesLinkedWashSession() throws Exception {
        String accessToken = registerActivateAndLogin("0901234712");
        String vehicleId = createVehicle(accessToken, "30H-223461");
        String bookingId = createBooking(accessToken, vehicleId).path("data").path("bookingId").asText();
        String sessionId = createWashSession(bookingId, "Customer arrived at bay 2");

        mockMvc.perform(get("/api/v1/customers/bookings/{bookingId}", bookingId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingId").value(bookingId))
                .andExpect(jsonPath("$.data.washSessionId").value(sessionId))
                .andExpect(jsonPath("$.data.staffName").isString())
                .andExpect(jsonPath("$.data.washStatus").value("PENDING"))
                .andExpect(jsonPath("$.data.notes").value("Customer arrived at bay 2"));
    }

    @Test
    void customerWashTrackingReturnsActiveSessionAndOwnerScopedDetail() throws Exception {
        String firstToken = registerActivateAndLogin("0901234716");
        String secondToken = registerActivateAndLogin("0901234717");
        String vehicleId = createVehicle(firstToken, "30H-223465");
        String bookingId = createBooking(firstToken, vehicleId).path("data").path("bookingId").asText();
        String sessionId = createWashSession(bookingId, "Tracking from customer app");

        mockMvc.perform(get("/api/v1/customers/wash-tracking/active")
                        .header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.washSessionId").value(sessionId))
                .andExpect(jsonPath("$.data.bookingId").value(bookingId))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.vehiclePlate").value("30H-223465"));

        mockMvc.perform(get("/api/v1/customers/wash-tracking/{washSessionId}", sessionId)
                        .header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.notes").value("Tracking from customer app"));

        mockMvc.perform(get("/api/v1/customers/wash-tracking/{washSessionId}", sessionId)
                        .header("Authorization", "Bearer " + secondToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void applyPointsRedeemsLoyaltyBalanceAndUpdatesBookingPricing() throws Exception {
        String phone = "0901234718";
        String accessToken = registerActivateAndLogin(phone);
        AuthUser customer = authUserRepository.findByPhone(phone).orElseThrow();
        LoyaltyAccount account = new LoyaltyAccount(customer);
        account.addPoints(120);
        loyaltyAccountRepository.saveAndFlush(account);

        String vehicleId = createVehicle(accessToken, "30H-223466");
        String bookingId = createBooking(accessToken, vehicleId).path("data").path("bookingId").asText();

        mockMvc.perform(post("/api/v1/bookings/{bookingId}/apply-points", bookingId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "pointsToApply": 50
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingId").value(bookingId))
                .andExpect(jsonPath("$.data.pointsApplied").value(50))
                .andExpect(jsonPath("$.data.discountAmount").value(50000))
                .andExpect(jsonPath("$.data.finalAmount").value(220000))
                .andExpect(jsonPath("$.data.loyaltyBalance").value(70));

        mockMvc.perform(get("/api/v1/customers/bookings/{bookingId}", bookingId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pricing.pointsRedeemed").value(50))
                .andExpect(jsonPath("$.data.pricing.pointsDiscount").value(50000))
                .andExpect(jsonPath("$.data.pricing.finalAmount").value(220000));
    }

    @Test
    void applyPointsRejectsDuplicateApplication() throws Exception {
        String phone = "0901234719";
        String accessToken = registerActivateAndLogin(phone);
        AuthUser customer = authUserRepository.findByPhone(phone).orElseThrow();
        LoyaltyAccount account = new LoyaltyAccount(customer);
        account.addPoints(160);
        loyaltyAccountRepository.saveAndFlush(account);

        String vehicleId = createVehicle(accessToken, "30H-223467");
        String bookingId = createBooking(accessToken, vehicleId).path("data").path("bookingId").asText();

        mockMvc.perform(post("/api/v1/bookings/{bookingId}/apply-points", bookingId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("{ \"pointsToApply\": 50 }"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/bookings/{bookingId}/apply-points", bookingId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("{ \"pointsToApply\": 50 }"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("POINTS_ALREADY_APPLIED"));
    }

    @Test
    void listBookingsRejectsInvalidStatusWithValidationError() throws Exception {
        String accessToken = registerActivateAndLogin("0901234711");

        mockMvc.perform(get("/api/v1/customers/bookings")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("status", "INVALID_STATUS"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors[0].field").value("status"));
    }

    @Test
    void cancelBookingTransitionsConfirmedBookingToCancelled() throws Exception {
        String accessToken = registerActivateAndLogin("0901234708");
        String vehicleId = createVehicle(accessToken, "30H-223459");
        String bookingId = createBooking(accessToken, vehicleId).path("data").path("bookingId").asText();

        mockMvc.perform(post("/api/v1/customers/bookings/{bookingId}/cancel", bookingId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "reason": "Cannot make it to appointment"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.refundStatus").value("INITIATED"));
    }

    @Test
    void cancelBookingAllowsPendingBooking() throws Exception {
        String accessToken = registerActivateAndLogin("0901234713");
        String vehicleId = createVehicle(accessToken, "30H-223462");
        String bookingId = createBooking(accessToken, vehicleId).path("data").path("bookingId").asText();
        setBookingStatus(bookingId, BookingStatus.PENDING);

        mockMvc.perform(post("/api/v1/customers/bookings/{bookingId}/cancel", bookingId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "reason": "Pending booking no longer needed"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.refundStatus").value("INITIATED"));
    }

    @Test
    void cancelBookingRejectsInProgressBookingWithResourceLocked() throws Exception {
        String accessToken = registerActivateAndLogin("0901234714");
        String vehicleId = createVehicle(accessToken, "30H-223463");
        String bookingId = createBooking(accessToken, vehicleId).path("data").path("bookingId").asText();
        setBookingStatus(bookingId, BookingStatus.IN_PROGRESS);

        mockMvc.perform(post("/api/v1/customers/bookings/{bookingId}/cancel", bookingId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "reason": "Trying to cancel after wash started"
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_LOCKED"));
    }

    @Test
    void cancelBookingRejectsCompletedBookingWithResourceLocked() throws Exception {
        String accessToken = registerActivateAndLogin("0901234715");
        String vehicleId = createVehicle(accessToken, "30H-223464");
        String bookingId = createBooking(accessToken, vehicleId).path("data").path("bookingId").asText();
        setBookingStatus(bookingId, BookingStatus.COMPLETED);

        mockMvc.perform(post("/api/v1/customers/bookings/{bookingId}/cancel", bookingId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "reason": "Trying to cancel completed service"
                                }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_LOCKED"));
    }

    @Test
    void openApiDocumentsBookingAndCatalogSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.schemas.ValidateVoucherRequest.properties.voucherCode.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.CreateBookingRequest.properties.vehicleId.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.CreateBookingResponse.properties.bookingId.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.CancelBookingResponse.properties.refundStatus.type").value("string"));
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/bookings/{bookingId}/apply-points']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/customers/wash-tracking/active']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/customers/wash-tracking/{washSessionId}']").exists());
    }

    private JsonNode createBooking(String accessToken, String vehicleId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/customers/bookings")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "vehicleId": "%s",
                                  "packageId": "pkg_001",
                                  "addons": ["addon_001"],
                                  "bookingDate": "2026-06-10",
                                  "bookingTime": "14:00",
                                  "voucherCode": "WELCOME20",
                                  "paymentMethod": "E_WALLET"
                                }
                                """.formatted(vehicleId)))
                .andReturn();
        return readJson(result);
    }

    private String createWashSession(String bookingId, String notes) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/operations/sessions")
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "bookingId": "%s",
                                  "notes": "%s"
                                }
                                """.formatted(bookingId, notes)))
                .andExpect(status().isCreated())
                .andReturn();
        return readJson(result).path("data").path("sessionId").asText();
    }

    private RequestPostProcessor authenticatedAdmin() {
        AuthUser admin = new AuthUser("Booking Admin", uniquePhone("0986"), "booking-admin-" + java.util.UUID.randomUUID() + "@example.com", "hash");
        admin.activate();
        ReflectionTestUtils.setField(admin, "role", UserRole.ADMIN);
        authUserRepository.saveAndFlush(admin);
        AuthUserPrincipal principal = new AuthUserPrincipal(admin);
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

    private String createVehicle(String accessToken, String plate) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/customers/vehicles")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "plate": "%s",
                                  "type": "CAR",
                                  "brand": "Toyota",
                                  "model": "Camry",
                                  "year": 2023,
                                  "color": "Silver"
                                }
                                """.formatted(plate)))
                .andExpect(status().isCreated())
                .andReturn();
        return readJson(result).path("data").path("vehicleId").asText();
    }

    private void setBookingStatus(String bookingId, BookingStatus status) {
        var booking = customerBookingRepository.findById(bookingId).orElseThrow();
        booking.updateStatus(status);
        customerBookingRepository.saveAndFlush(booking);
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
