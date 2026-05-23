package com.autowash.operation;

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
class OperationsQueueControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void queueReturnsStableKanbanContract() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/v1/operations/queue")).andReturn();
        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());

        assertThat(response.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(body.path("success").asBoolean()).isTrue();
        assertThat(body.path("statusCode").asInt()).isEqualTo(200);
        assertThat(body.path("data").path("summary").path("total").asInt()).isEqualTo(0);
        assertThat(body.path("data").path("columns")).hasSize(4);
        assertThat(body.path("data").path("columns").get(0).path("status").asText()).isEqualTo("PENDING");
        assertThat(body.path("data").path("columns").get(1).path("status").asText()).isEqualTo("CHECKED_IN");
        assertThat(body.path("data").path("columns").get(2).path("status").asText()).isEqualTo("IN_PROGRESS");
        assertThat(body.path("data").path("columns").get(3).path("status").asText()).isEqualTo("COMPLETED");
    }
}
