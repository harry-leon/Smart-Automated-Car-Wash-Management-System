package com.autowash.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.autowash.entity.User;
import com.autowash.entity.enums.OtpPurpose;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.autowash.repository.LoyaltyAccountRepository;
import com.autowash.repository.UserRepository;
import com.autowash.repository.OtpVerificationRepository;
import com.autowash.repository.UserPreferenceRepository;
import java.time.Instant;
import java.util.Base64;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = "autowash.auth.otp.max-attempts=5")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;


    @Autowired
    private UserRepository UserRepository;

    @Autowired
    private OtpVerificationRepository OtpVerificationRepository;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    @Autowired
    private LoyaltyAccountRepository loyaltyAccountRepository;

    @MockBean
    private com.autowash.service.GoogleOAuthClient googleOAuthClient;

    @Test
    void registerCreatesPendingCustomerWithDefaultMemberTier() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Nguyen Van A",
                                  "phone": "0901234568",
                                  "email": "pending@example.com",
                                  "password": "SecurePass1!",
                                  "passwordConfirm": "SecurePass1!"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.phone").value("0901234568"))
                .andExpect(jsonPath("$.data.status").value("INACTIVE"))
                .andExpect(jsonPath("$.data.requiresOtpVerification").value(true));

        User user = UserRepository.findByPhone("0901234568").orElseThrow();
        Assertions.assertTrue(userPreferenceRepository.existsById(user.getId()));
        Assertions.assertTrue(loyaltyAccountRepository.findByCustomerId(user.getId()).isPresent());
    }

    @Test
    void registerRejectsDuplicatePhone() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Nguyen Van A",
                                  "phone": "0901234567",
                                  "email": "duplicate-phone@example.com",
                                  "password": "SecurePass1!",
                                  "passwordConfirm": "SecurePass1!"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Duplicate User",
                                  "phone": "0901234567",
                                  "email": "dup@example.com",
                                  "password": "SecurePass1!",
                                  "passwordConfirm": "SecurePass1!"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("DUPLICATE_PHONE"));
    }

    @Test
    void sendOtpReturnsDevOtpForPendingAccount() throws Exception {
        registerCustomer("0901234569");

        mockMvc.perform(post("/api/v1/auth/otp/send")
                        .contentType("application/json")
                        .content("""
                                { "phone": "0901234569" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone").value("0901234569"))
                .andExpect(jsonPath("$.data.otpExpiresIn").value(300))
                .andExpect(jsonPath("$.data.devOtp").isString());
    }

    @Test
    void registrationOtpIsSentToEmailAndStoredHashed() throws Exception {
        registerCustomer("0901234590");
        String email = "0901234590@example.com";
        String otp = sendOtpByEmailAndExtractDevOtp(email);

        User user = UserRepository.findByEmailIgnoreCase(email).orElseThrow();
        String storedCode = OtpVerificationRepository.findFirstByUserAndPurposeAndVerifiedAtIsNullOrderByCreatedAtDesc(
                        user,
                        OtpPurpose.EMAIL_REGISTRATION
                )
                .orElseThrow()
                .getCodeHash();

        Assertions.assertNotEquals(otp, storedCode);
        Assertions.assertTrue(storedCode.length() > 6);
    }

    @Test
    void resendOtpIsLimitedToThreeTimesPerEmailWindow() throws Exception {
        registerCustomer("0901234591");
        String email = "0901234591@example.com";

        sendOtpByEmailAndExtractDevOtp(email);
        sendOtpByEmailAndExtractDevOtp(email);

        mockMvc.perform(post("/api/v1/auth/otp/send")
                        .contentType("application/json")
                        .content("""
                                { "email": "%s" }
                                """.formatted(email)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.errorCode").value("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    void failedOtpAttemptsLockCurrentOtpButAllowNewOtp() throws Exception {
        registerCustomer("0901234592");
        String email = "0901234592@example.com";
        sendOtpByEmailAndExtractDevOtp(email);

        for (int attempt = 1; attempt <= 4; attempt++) {
            mockMvc.perform(post("/api/v1/auth/otp/verify")
                            .contentType("application/json")
                            .content("""
                                    {
                                      "email": "%s",
                                      "otp": "000000"
                                    }
                                    """.formatted(email)))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.errorCode").value("INVALID_OTP"));
        }

        mockMvc.perform(post("/api/v1/auth/otp/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "%s",
                                  "otp": "000000"
                                }
                                """.formatted(email)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("RATE_LIMIT_EXCEEDED"));

        sendOtpByEmailAndExtractDevOtp(email);
    }

    @Test
    void verifyOtpActivatesAccountAndReturnsTokens() throws Exception {
        registerCustomer("0901234570");
        String otp = sendOtpAndExtractDevOtp("0901234570");

        mockMvc.perform(post("/api/v1/auth/otp/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "phone": "0901234570",
                                  "otp": "%s"
                                }
                                """.formatted(otp)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.tier").value("MEMBER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString());
    }

    @Test
    void accessTokenContainsSharedUserClaims() throws Exception {
        registerCustomer("0901234593");
        String otp = sendOtpAndExtractDevOtp("0901234593");
        String accessToken = verifyOtp("0901234593", otp).path("data").path("accessToken").asText();

        JsonNode claims = decodeJwtPayload(accessToken);

        Assertions.assertEquals(claims.path("sub").asText(), claims.path("userId").asText());
        Assertions.assertEquals("CUSTOMER", claims.path("role").asText());
        Assertions.assertEquals("ACTIVE", claims.path("status").asText());
    }

    @Test
    void forgotPasswordRequestAndResetAllowLoginWithNewPassword() throws Exception {
        registerCustomer("0901234594");
        String registrationOtp = sendOtpAndExtractDevOtp("0901234594");
        verifyOtp("0901234594", registrationOtp);

        MvcResult forgotPasswordResult = mockMvc.perform(post("/api/v1/auth/forgot-password/request")
                        .contentType("application/json")
                        .content("""
                                { "email": "0901234594@example.com" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.devOtp").isString())
                .andReturn();

        String resetOtp = readJson(forgotPasswordResult).path("data").path("devOtp").asText();

        mockMvc.perform(post("/api/v1/auth/forgot-password/reset")
                        .contentType("application/json")
                        .content("""
                                {
                                  "email": "0901234594@example.com",
                                  "otp": "%s",
                                  "newPassword": "NewSecurePass1!",
                                  "newPasswordConfirm": "NewSecurePass1!"
                                }
                                """.formatted(resetOtp)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "identifier": "0901234594@example.com",
                                  "password": "NewSecurePass1!",
                                  "rememberMe": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString());
    }

    @Test
    void loginReturnsTokensForActiveAccount() throws Exception {
        registerCustomer("0901234571");
        String otp = sendOtpAndExtractDevOtp("0901234571");
        verifyOtp("0901234571", otp);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "identifier": "0901234571",
                                  "password": "SecurePass1!",
                                  "rememberMe": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString());
    }

    @Test
    void loginAcceptsEmailIdentifierForActiveAccount() throws Exception {
        registerCustomer("0901234578");
        String otp = sendOtpAndExtractDevOtp("0901234578");
        verifyOtp("0901234578", otp);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "identifier": "0901234578@example.com",
                                  "password": "SecurePass1!",
                                  "rememberMe": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString());
    }

    @Test
    void refreshReturnsNewAccessToken() throws Exception {
        registerCustomer("0901234572");
        String otp = sendOtpAndExtractDevOtp("0901234572");
        String refreshToken = verifyOtp("0901234572", otp).path("data").path("refreshToken").asText();

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType("application/json")
                        .content("""
                                { "refreshToken": "%s" }
                                """.formatted(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString());
    }

    @Test
    void logoutRevokesRefreshToken() throws Exception {
        registerCustomer("0901234573");
        String otp = sendOtpAndExtractDevOtp("0901234573");
        String refreshToken = verifyOtp("0901234573", otp).path("data").path("refreshToken").asText();

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType("application/json")
                        .content("""
                                { "refreshToken": "%s" }
                                """.formatted(refreshToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType("application/json")
                        .content("""
                                { "refreshToken": "%s" }
                                """.formatted(refreshToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("TOKEN_INVALID"));
    }

    @Test
    void loginRejectsPendingAccount() throws Exception {
        registerCustomer("0901234574");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content("""
                                {
                                  "identifier": "0901234574",
                                  "password": "SecurePass1!",
                                  "rememberMe": false
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"));
    }

    @Test
    void sendOtpRejectsActiveAccount() throws Exception {
        registerCustomer("0901234579");
        String otp = sendOtpAndExtractDevOtp("0901234579");
        verifyOtp("0901234579", otp);

        mockMvc.perform(post("/api/v1/auth/otp/send")
                        .contentType("application/json")
                        .content("""
                                { "phone": "0901234579" }
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_LOCKED"));
    }

    @Test
    void verifyOtpRejectsActiveAccount() throws Exception {
        registerCustomer("0901234580");
        String otp = sendOtpAndExtractDevOtp("0901234580");
        verifyOtp("0901234580", otp);

        mockMvc.perform(post("/api/v1/auth/otp/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "phone": "0901234580",
                                  "otp": "%s"
                                }
                                """.formatted(otp)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_LOCKED"));
    }

    @Test
    void registerRejectsInvalidPhoneWithValidationErrorShape() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Bad Phone",
                                  "phone": "123",
                                  "password": "SecurePass1!",
                                  "passwordConfirm": "SecurePass1!"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors[0].field").exists());
    }

    @Test
    void loginPreflightAllowsFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }



    private void registerCustomer(String phone) throws Exception {
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
    }

    private String sendOtpAndExtractDevOtp(String phone) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/otp/send")
                        .contentType("application/json")
                        .content("""
                                { "phone": "%s" }
                                """.formatted(phone)))
                .andExpect(status().isOk())
                .andReturn();
        return readJson(result).path("data").path("devOtp").asText();
    }

    private String sendOtpByEmailAndExtractDevOtp(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/otp/send")
                        .contentType("application/json")
                        .content("""
                                { "email": "%s" }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();
        return readJson(result).path("data").path("devOtp").asText();
    }

    private JsonNode verifyOtp(String phone, String otp) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/otp/verify")
                        .contentType("application/json")
                        .content("""
                                {
                                  "phone": "%s",
                                  "otp": "%s"
                                }
                                """.formatted(phone, otp)))
                .andExpect(status().isOk())
                .andReturn();
        return readJson(result);
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private JsonNode decodeJwtPayload(String token) throws Exception {
        String payload = token.split("\\.")[1];
        byte[] decoded = Base64.getUrlDecoder().decode(payload);
        return objectMapper.readTree(decoded);
    }
}
