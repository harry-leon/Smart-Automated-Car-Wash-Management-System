package com.autowash.admin;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.autowash.entity.User;
import com.autowash.entity.enums.UserRole;
import com.autowash.repository.UserRepository;
import com.autowash.shared.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class AdminServiceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void adminCanCreateAndUpdateServiceWithImageUrl() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/v1/admin/services")
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Foam Wash",
                                  "description": "Foam wash with soft mitts",
                                  "price": 80000,
                                  "durationMinutes": 20,
                                  "imageUrl": "https://cdn.example.com/services/foam-wash.jpg",
                                  "status": "ACTIVE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.imageUrl").value("https://cdn.example.com/services/foam-wash.jpg"))
                .andReturn();

        String serviceId = readJson(createResult).path("data").path("serviceId").asText();

        mockMvc.perform(get("/api/v1/admin/services/{serviceId}", serviceId)
                        .with(authenticatedAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.imageUrl").value("https://cdn.example.com/services/foam-wash.jpg"));

        mockMvc.perform(put("/api/v1/admin/services/{serviceId}", serviceId)
                        .with(authenticatedAdmin())
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Foam Wash Plus",
                                  "description": "Foam wash with premium shampoo",
                                  "price": 95000,
                                  "durationMinutes": 25,
                                  "imageUrl": "https://cdn.example.com/services/foam-wash-plus.jpg",
                                  "status": "ACTIVE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.imageUrl").value("https://cdn.example.com/services/foam-wash-plus.jpg"))
                .andExpect(jsonPath("$.data.name").value("Foam Wash Plus"));
    }

    private RequestPostProcessor authenticatedAdmin() {
        User admin = new User("Service Admin", uniquePhone("0977"), "service-admin-" + java.util.UUID.randomUUID() + "@example.com", "hash");
        admin.activate();
        ReflectionTestUtils.setField(admin, "role", UserRole.ADMIN);
        userRepository.saveAndFlush(admin);
        UserPrincipal principal = new UserPrincipal(admin);
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities());
        return authentication(token);
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String uniquePhone(String prefix) {
        String digits = java.util.UUID.randomUUID().toString().replaceAll("\\D", "");
        while (digits.length() < 6) {
            digits += "0";
        }
        return prefix + digits.substring(0, 6);
    }
}
