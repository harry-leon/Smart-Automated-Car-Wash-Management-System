package com.autowash.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AdminDashboardControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void metricsReturnsStableBasicDashboardContract() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/v1/admin/dashboard/metrics")).andReturn();
        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("statusCode").asInt()).isEqualTo(200);
        assertThat(body.path("data").path("metrics").path("totalBookings").asInt()).isEqualTo(0);
        assertThat(body.path("data").path("seededAccounts").path("adminCount").asLong()).isEqualTo(1);
        assertThat(body.path("data").path("seededAccounts").path("staffCount").asLong()).isEqualTo(2);
    }
}
