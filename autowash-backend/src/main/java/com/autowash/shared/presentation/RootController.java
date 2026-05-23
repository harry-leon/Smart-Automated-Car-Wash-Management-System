package com.autowash.shared.presentation;

import com.autowash.shared.api.ApiResponse;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, Object>>> root() {
        Map<String, Object> data = Map.of(
                "service", "AutoWash Pro Backend API",
                "version", "v1",
                "status", "UP",
                "authEndpoints", Map.of(
                        "register", "POST /api/v1/auth/register",
                        "login", "POST /api/v1/auth/login"
                )
        );

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "AutoWash backend is running", data));
    }

    @GetMapping("/api/v1/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK,
                "Service is healthy",
                Map.of("status", "UP")
        ));
    }
}
