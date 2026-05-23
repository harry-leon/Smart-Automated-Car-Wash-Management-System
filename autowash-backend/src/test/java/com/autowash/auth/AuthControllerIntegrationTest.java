package com.autowash.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    private static final String PASSWORD = "Customer@123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerCreatesCustomerWithoutReturningSensitiveFields() throws Exception {
        String phone = randomPhone();

        MvcResult response = register(phone);
        String responseBody = response.getResponse().getContentAsString();
        JsonNode body = objectMapper.readTree(responseBody);

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("statusCode").asInt()).isEqualTo(201);
        assertThat(body.path("data").path("phone").asText()).isEqualTo(phone);
        assertThat(body.path("data").path("role").asText()).isEqualTo("CUSTOMER");
        assertThat(responseBody).doesNotContain("passwordHash");
        assertThat(responseBody).doesNotContain("password");
    }

    @Test
    void registerRejectsDuplicatePhone() throws Exception {
        String phone = randomPhone();
        register(phone);

        MvcResult duplicateResponse = register(phone);
        JsonNode body = objectMapper.readTree(duplicateResponse.getResponse().getContentAsString());

        assertThat(duplicateResponse.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(body.path("success").asBoolean()).isFalse();
        assertThat(body.path("errorCode").asText()).isEqualTo("DUPLICATE_PHONE");
    }

    @Test
    void loginReturnsAccessTokenAndUserRole() throws Exception {
        String phone = randomPhone();
        register(phone);

        MvcResult response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", phone, "password", PASSWORD))))
                .andReturn();
        String responseBody = response.getResponse().getContentAsString();
        JsonNode body = objectMapper.readTree(responseBody);

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("data").path("phone").asText()).isEqualTo(phone);
        assertThat(body.path("data").path("role").asText()).isEqualTo("CUSTOMER");
        assertThat(body.path("data").path("accessToken").asText()).isNotBlank();
        assertThat(body.path("data").path("tokenType").asText()).isEqualTo("Bearer");
        assertThat(responseBody).doesNotContain("passwordHash");
    }

    @Test
    void loginRejectsInvalidCredentials() throws Exception {
        MvcResult response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "0999999999", "password", "Wrong@123"))))
                .andReturn();
        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(body.path("success").asBoolean()).isFalse();
        assertThat(body.path("errorCode").asText()).isEqualTo("INVALID_CREDENTIALS");
    }

    private MvcResult register(String phone) throws Exception {
        return mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Nguyen Van A",
                        "phone", phone,
                        "email", phone + "@example.com",
                        "password", PASSWORD,
                        "passwordConfirm", PASSWORD
                ))))
                .andReturn();
    }

    private String randomPhone() {
        long suffix = Math.abs(System.nanoTime() % 100_000_000L);
        return "09" + String.format("%08d", suffix);
    }
}
