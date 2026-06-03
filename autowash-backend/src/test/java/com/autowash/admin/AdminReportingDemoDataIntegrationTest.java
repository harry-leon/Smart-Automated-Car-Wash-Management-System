package com.autowash.admin;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "spring.flyway.locations=classpath:db/migration,classpath:db/demo")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminReportingDemoDataIntegrationTest {

    private static final String DEMO_CUSTOMER_ID = "d5c8f8e0-a8d0-4f51-b8d9-a47738b7e28d";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void demoCustomerWashHistoryLoadsSeededSessions() throws Exception {
        mockMvc.perform(get("/api/v1/admin/customers/{customerId}/wash-sessions", DEMO_CUSTOMER_ID)
                        .with(user("admin").roles("ADMIN"))
                        .param("page", "1")
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(6)))
                .andExpect(jsonPath("$.data[?(@.bookingId == 'BK_1717000000001')].status").value(contains("COMPLETED")))
                .andExpect(jsonPath("$.pagination.total", greaterThanOrEqualTo(6)));
    }
}
