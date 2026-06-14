package com.autowash.admin;

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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminBusinessHealthReportIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void reportReturnsExecutiveBusinessHealthBlocks() throws Exception {
        mockMvc.perform(get("/api/v1/admin/reports/business-health")
                        .with(user("admin").roles("ADMIN"))
                        .param("range", "LAST_30_DAYS")
                        .param("analysisGroup", "service"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.kpis.revenueThisPeriod").exists())
                .andExpect(jsonPath("$.data.kpis.completedBookings").exists())
                .andExpect(jsonPath("$.data.trends.revenue.points").isArray())
                .andExpect(jsonPath("$.data.breakdowns.service.items").isArray())
                .andExpect(jsonPath("$.data.insights").isArray())
                .andExpect(jsonPath("$.data.capabilities.channelAvailable").value(false));
    }
}
