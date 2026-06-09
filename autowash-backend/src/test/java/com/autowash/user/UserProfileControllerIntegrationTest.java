package com.autowash.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class UserProfileControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getProfileReturnsAuthenticatedCustomerProfile() throws Exception {
        String accessToken = registerActivateAndLogin("0901234680");

        mockMvc.perform(get("/api/v1/users/profile")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone").value("0901234680"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.tier").value("MEMBER"))
                .andExpect(jsonPath("$.data.loyaltyBalance").value(0))
                .andExpect(jsonPath("$.data.preferences.language").value("VI"))
                .andExpect(jsonPath("$.data.preferences.theme").value("LIGHT"));
    }

    @Test
    void getProfileRejectsUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/v1/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProfileUpdatesFullNameEmailAndPhone() throws Exception {
        String accessToken = registerActivateAndLogin("0901234681");

        mockMvc.perform(put("/api/v1/users/profile")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Nguyen Van Updated",
                                  "email": "updated@example.com",
                                  "phone": "0901234699"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Nguyen Van Updated"))
                .andExpect(jsonPath("$.data.email").value("updated@example.com"))
                .andExpect(jsonPath("$.data.phone").value("0901234699"));
    }

    @Test
    void updateProfileRejectsDuplicatePhone() throws Exception {
        String firstAccessToken = registerActivateAndLogin("0901234585");
        registerActivateAndLogin("0901234586");

        mockMvc.perform(put("/api/v1/users/profile")
                        .header("Authorization", "Bearer " + firstAccessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Nguyen Van Updated",
                                  "email": "updated@example.com",
                                  "phone": "0901234586"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("DUPLICATE_PHONE"));
    }

    @Test
    void updateProfileRejectsInvalidEmail() throws Exception {
        String accessToken = registerActivateAndLogin("0901234682");

        mockMvc.perform(put("/api/v1/users/profile")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "fullName": "Nguyen Van Updated",
                                  "email": "not-an-email"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    @Test
    void getPreferencesReturnsCurrentUserPreferences() throws Exception {
        String accessToken = registerActivateAndLogin("0901234683");

        mockMvc.perform(get("/api/v1/users/preferences")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.language").value("VI"))
                .andExpect(jsonPath("$.data.theme").value("LIGHT"))
                .andExpect(jsonPath("$.data.notificationsEnabled").value(true));
    }

    @Test
    void updatePreferencesPersistsNewValues() throws Exception {
        String accessToken = registerActivateAndLogin("0901234684");

        mockMvc.perform(put("/api/v1/users/preferences")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType("application/json")
                        .content("""
                                {
                                  "language": "EN",
                                  "theme": "DARK",
                                  "notificationsEnabled": true,
                                  "emailNotifications": true,
                                  "smsNotifications": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.language").value("EN"))
                .andExpect(jsonPath("$.data.theme").value("DARK"))
                .andExpect(jsonPath("$.data.notificationsEnabled").value(true))
                .andExpect(jsonPath("$.data.updatedAt").isString())
                .andExpect(jsonPath("$.data.userId").doesNotExist())
                .andExpect(jsonPath("$.data.emailNotifications").doesNotExist())
                .andExpect(jsonPath("$.data.smsNotifications").doesNotExist());
    }

    @Test
    void getProfileRequiresValidBearerToken() throws Exception {
        mockMvc.perform(get("/api/v1/users/profile")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void openApiDocumentsProfileAndPreferencesSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.schemas.UpdateUserProfileRequest.properties.fullName.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.UpdateUserProfileRequest.properties.email.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.UpdateUserProfileRequest.properties.phone.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.UpdateUserPreferencesResponse.properties.language.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.UpdateUserPreferencesResponse.properties.theme.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.UpdateUserPreferencesResponse.properties.notificationsEnabled.type").value("boolean"))
                .andExpect(jsonPath("$.components.schemas.UpdateUserPreferencesResponse.properties.updatedAt.type").value("string"))
                .andExpect(jsonPath("$.components.schemas.UpdateUserPreferencesResponse.properties.userId").doesNotExist())
                .andExpect(jsonPath("$.components.schemas.UpdateUserPreferencesResponse.properties.emailNotifications").doesNotExist())
                .andExpect(jsonPath("$.components.schemas.UpdateUserPreferencesResponse.properties.smsNotifications").doesNotExist());
    }

    private String registerActivateAndLogin(String phone) throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
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
                .andReturn();

        String otp = readJson(registerResult).path("data").path("devOtp").asText();

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
