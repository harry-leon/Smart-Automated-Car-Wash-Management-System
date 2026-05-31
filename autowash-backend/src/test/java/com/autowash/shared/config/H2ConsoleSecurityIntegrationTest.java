package com.autowash.shared.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.h2.console.enabled=true",
        "spring.h2.console.path=/h2-console"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class H2ConsoleSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void h2ConsolePathIsNotRejectedBySecurityWhenEnabled() throws Exception {
        mockMvc.perform(get("/h2-console/"))
                .andExpect(status().isNotFound())
                .andExpect(header().string("X-Frame-Options", "SAMEORIGIN"));
    }
}
