package com.autowash.shared.controller;

import com.autowash.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "System")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend health")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok("AutoWash backend is healthy", Map.of("status", "UP"));
    }
}
